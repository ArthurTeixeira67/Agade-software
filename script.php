<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';

header('Content-Type: application/json');

// extract(_POST);
// $acao

$acao = $_POST['acao'] ?? $_GET['acao'] ?? '';

switch ($acao) {

    case 'listarPackages':
        listarPackages();
        break;

    case 'packageShow':
        packageShow();
        break;

    case 'criarBasesFontes':
        criarBasesFontes($conn);
        break;

    default:
        echo json_encode([
            "erro" => "Ação inválida."
        ]);
        break;
}

function listarPackages(){

    $url = $_POST['url'] ?? $_GET['url'] ?? '';

    if(empty($url)){
        echo json_encode([
            "erro" => "URL não informada."
        ]);
        return;
    }

    $url_obj = parse_url($url);

    $api = $url_obj['scheme'] .
           '://' .
           $url_obj['host'] .
           '/api/3/action/package_list';

    $resultado = requisicaoCKAN($api);

    if(!$resultado){
        return;
    }

    echo json_encode($resultado);

}

function packageShow(){

    $url = $_POST['url'] ?? $_GET['url'] ?? '';
    $id  = $_POST['id']  ?? $_GET['id']  ?? '';

    if(empty($url) || empty($id)){
        echo json_encode([
            "erro" => "URL ou Package ID não informado."
        ]);
        return;
    }

    $url_obj = parse_url($url);

    $api = $url_obj['scheme'] .
           '://' .
           $url_obj['host'] .
           '/api/3/action/package_show?id=' .
           urlencode($id);

    $resultado = requisicaoCKAN($api);

    if(!$resultado){
        return;
    }

    echo json_encode($resultado);

}

function requisicaoCKAN(string $url){

    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Agade Software');

    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $json = curl_exec($ch);

    if(curl_errno($ch)){

        echo json_encode([
            "erro" => curl_error($ch)
        ]);

        curl_close($ch);
        return null;
    }

    curl_close($ch);

    return json_decode($json, true);

}

function criarBasesFontes($conn) {

    $dados = $_POST['dados'] ?? '';

    if(empty($dados)){
        echo json_encode([
            "erro" => "Dados não enviados."
        ]);
        return;
    }

    $dados = json_decode($dados, true);

    if(!$dados){
        echo json_encode([
            "erro" => "Erro ao interpretar os dados."
        ]);
        return;
    }

    pg_query($conn, "BEGIN");

    $sql_base = "
        INSERT INTO agade_software.bases
        (
            id_base,
            nome,
            descricao,
            tabela_destino,
            fonte,
            fonte_link,
            fonte_api
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
        )
    ";

    $resultado = pg_query_params($conn, $sql_base, [
        $dados['id_base'],
        $dados['nome'],
        $dados['descricao'],
        $dados['tabela_destino'],
        $dados['fonte'],
        $dados['fonte_link'],
        $dados['fonte_api']
    ]);

    if(!$resultado){

        pg_query($conn, "ROLLBACK");

        echo json_encode([
            "erro" => "Erro ao inserir a base.",
            "detalhes" => pg_last_error($conn)
        ]);

        return;
    }

    $sql_fonte = "
        INSERT INTO agade_software.fontes
        (
            resource_id,
            url,
            nome,
            ultima_atualizacao,
            package_id,
            delimitador,
            id_base
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
        )
    ";

    foreach($dados['resources'] as $resource){

        $resultado = pg_query_params($conn, $sql_fonte, [
            $resource['resource_id'],
            $resource['url'],
            $resource['nome'],
            $resource['ultima_atualizacao'],
            $resource['package_id'],
            $resource['delimitador'],
            $resource['id_base']
        ]);

        if(!$resultado){

            pg_query($conn, "ROLLBACK");

            echo json_encode([
                "erro" => "Erro ao inserir um resource.",
                "resource_id" => $resource['resource_id'],
                "detalhes" => pg_last_error($conn)
            ]);

            return;
        }
    }

    pg_query($conn, "COMMIT");

    echo json_encode([
        "success" => true,
        "mensagem" => "Base e fontes inseridas com sucesso."
    ]);
}