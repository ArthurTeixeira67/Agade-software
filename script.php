<?php

require_once 'config.php';

header('Content-Type: application/json');

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
    
}

?>