<?php

header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);

$acao = $_GET['acao'] ?? '';

function listarPackages() {

    $url = $_GET['url'] ?? '';

    if (empty($url)) {

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

    $ch = curl_init($api);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Agade Software');
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $json = curl_exec($ch);

    if ($json === false) {
        echo json_encode([
            "erro" => curl_error($ch)
        ]);
        curl_close($ch);
        return;
    }

    curl_close($ch);

    echo $json;
};

function packageShow(){

    $url = $_GET['url'] ?? '';
    $id  = $_GET['id'] ?? '';

    if(empty($url) || empty($id)){
        echo json_encode([
            "erro" => "URL ou ID não informado."
        ]);
        return;
    }

    $url_obj = parse_url($url);

    $api = $url_obj['scheme'] .
           '://' .
           $url_obj['host'] .
           '/api/3/action/package_show?id=' .
           urlencode($id);

    $ch = curl_init($api);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Agade Software');

    // Apenas para desenvolvimento
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

    $json = curl_exec($ch);

    if($json === false){
        echo json_encode([
            "erro" => curl_error($ch)
        ]);
        curl_close($ch);
        return;
    }

    curl_close($ch);

    echo $json;
}

switch ($acao) {
    
    case 'listarPackages':
        listarPackages();
        break;

    case 'packageShow':
        packageShow();
        break;
    
    default:
        echo json_encode([
            "erro" => "Ação inválida"
        ]);
};

?>