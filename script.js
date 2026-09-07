console.log(`Olá Agadê!`);

// guardando elementos de botões e input's em variaveis e objetos.
const btn_package = $("#btn_package");
const url_package = $("#url_package");
const accordion = $("#accordion")
const campos = [
    $("#id_base"),
    $("#nome"),
    $("#descricao"),
    $("#tabela_destino"),
    $("#fonte"),
    $("#fonte_link"),
    $("#fonte_api")
];

// função para verificar campos vazios da página
function campo_vazio(campos, mensagem_erro) {

    let valido = true;

    campos.forEach(function(campo) {
        if(!campo.val()) {
            campo.addClass("campo-invalido");
            valido = false;
        }
    });

    if(!valido) {
        alert(mensagem_erro);
    }

    return valido;

}

// remove as classes de 'campo-invalido' caso o campo seja preenchido posteriormente
$("form input, form textarea").on("input", function(event) {

    const campo = $(this)

    if(campo.val()) {
        campo.removeClass("campo-invalido");
    }

});

// funcao p/ listar os package's depois que inserida a url
function listar_packages() {

    if(!campo_vazio([url_package], "Digite uma URL!")) {
        return;
    }

    const url = url_package.val().trim();

    accordion.html("<p>Carregando...</p>")

    $.post(

        "script.php",
        {
            acao: "listar_packages",
            url: url
        },
        function(resposta) {
           if(!resposta.sucess) {
            accordion.html("<p>Erro ao carregar os package's.</p>")
            console.log(resposta.error);
            return;
           }
           montar_accordion(resposta.result, url);
        },
        "json"

    ).fail(function(xhr, status, error) {

        console.log("Erro ao carregar os package's");
        console.log(error);
        accordion.html("<p>Erro ao carregar os packages.</p>")

    });

};

// caso o botão 'Listar package's' seja clicado
btn_package.on("click", listar_packages);