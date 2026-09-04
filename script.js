console.log(`Olá Agadê!`);

// guardando elementos de botões e input's em variaveis e objetos.
const btn_package = $("#btn_package");
const url_package = $("#url_package");
const campos = [
    $("#id_base"),
    $("#nome"),
    $("#descricao"),
    $("#tabela_destino"),
    $("#fonte"),
    $("#fonte_link"),
    $("#fonte_api")
];

// caso o botão 'Listar package's' seja clicado.
$("#btn_package").on("click", function(event) {

    if(!url_package.val()){
        url_package.addClass("campo-invalido");
        alert("Digite uma URL!")
    }

});

// caso o botão 'Criar bases e fontes' seja clicado.
$("form").on("submit", function(event) {
    // flag para validar campos.
    let valido = true;

    // percorre cada campo e verifica se está preenchido (caso não, marca o campo em vermelho e aciona um alerta).
    campos.forEach(function(campo){
        if (!campo.val()) {
            campo.addClass("campo-invalido");
            valido = false;
        }
    });

    if(!valido) {
        event.preventDefault();
        alert("Preencha todos os campos obrigatórios!")
    }

});


