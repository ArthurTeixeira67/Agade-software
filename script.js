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


// caso o botão 'Criar bases e fontes' seja clicado
$("form").on("submit", function(event) {
    if (!campo_vazio(campos, "Preencha todos os campos obrigatórios!")) {
        event.preventDefault();
    }

});

// caso o botão 'Listar package's' seja clicado
$("#btn_package").on("click", function(event) {

    if (!campo_vazio([url_package], "Digite uma URL!")) {
    
        return;

    }

   accordion.html("<p>Carregando...</p>");

});