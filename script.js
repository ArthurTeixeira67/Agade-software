console.log(`Olá agadê!`);

// seleciona no html respectivamente: campo 'url', botão 'listar package's, section onde os package's serão listados.
const input_url = $("#input_url");
const btn_listar_package = $("#btn_package");
const lista_package = $("#lista_package");

// função p/ verificar se todos os campos foram preenchidos.
$("#submit_form").click(function(event) {
    
    // flag p/ verificar
    let valido = true;

    const campos = [
        $("#id_base"),
        $("#nome"),
        $("#descricao"),
        $("#tabela_destino"),
        $("#fonte"),
        $("#fonte_link"),
        $("#fonte_api")
    ];

    campos.forEach(function(campo) {

        // adiciona a classe 'campo invalido' caso o campo esteja vazio.
        if(!campo.val()) {
            campo.addClass("campo-invalido");
            valido = false
        }

    });

    if(!valido) {
        event.preventDefault();
        alert(`Preencha todos os campos obrigatórios para a base de dados.`);
    }

});

// função p/ verificar se a url foi preenchida.
$("#btn_package").click(function(event){

    if(!input_url.val()) {
        input_url.addClass("campo-invalido")
        alert(`preencha o campo com alguma url.`);
        event.preventDefault();

    }

});

// função p/ remover o campo invalido caso ele seja pressionado ou preenchido.
$("form input, form textarea").add(input_url).on("input", function() {

    if($(this).val()) {
        $(this).removeClass("campo-invalido")
    }

});



