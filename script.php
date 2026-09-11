<?php

// faz o php mostrar erros nas respostas caso haja algum erro
ini_set('display_errors', 1);
error_reporting(E_ALL);

// chama o arquivo que faz a conexão com o banco de dados
require_once 'config.php';

// informa que a resposta será enviada em json
header('Content-Type: application/json');

// coleta e guarda os valores enviados pelo js
extract($_POST);

// chama a função que o js mandar
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

    // caso a ação seja inválida (ver se pode tirar ae)
    default:
        echo json_encode([
            "erro" => "Ação inválida."
        ]);
        break;
}

// função que vai listar os packages
function listarPackages(){  
    // guarda as variáveis do post dentro da função
    extract($_POST);

    // monta a url da api do ckan que lista os packages
    $api = $url . '/api/3/action/package_list';

    // chama a função que faz a requisição e guarda o resultado
    $resultado = requisicaoCKAN($api);

    // verifica o resultado da requisição
    if(!$resultado){
        return;
    }

    // devolve para o js
    echo json_encode($resultado);
}

function packageShow(){
    // guarda as variáveis do post dentro da função
    extract($_POST);

    // monta a url da api do ckan que busca os dados do package
    $api = $url . '/api/3/action/package_show?id=' . urlencode($id);

    // chama a função que faz a requisição e guarda o resultado
    $resultado = requisicaoCKAN($api);

    // verifica o resultado da requisição
    if(!$resultado){
        return;
    }

    // devolve para o js
    echo json_encode($resultado);
}

// função que faz a requisição ckan
function requisicaoCKAN($url){

    // inica a requisição
    $ch = curl_init($url);
    
    // configura a requisição (retorna a resposta, segue redirecionamentos e identifica a aplicação)
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Agade Software');

    // desativa a verificação do certificado SSL (TEMPORARIAMENTE!!!! VER ISSO AQUI DEPOIS!!!!) 
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    // executa a requisição
    $json = curl_exec($ch);

    // verifica se houve erro na requisição
    if(curl_errno($ch)){
        echo json_encode([
            "erro" => curl_error($ch)
        ]);
        curl_close($ch);
        return null;
    }

    // encerra o cURL
    curl_close($ch);

    // converte a resposta em um array e devolve para quem chamou
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