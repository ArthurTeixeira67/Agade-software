console.log(`Olá agadê!`);


// pega oque foi digitado no formulário e verifica campos vazios
$("form").on("submit", function(event){

    let valido = true;

    const campos_etl = [
        $("#id_base"),
        $("#nome"),
        $("#descricao"),
        $("#tabela_destino"),
        $("#tabela_destino"),
        $("#fonte"),
        $("#fonte_link"),
        $("#fonte_api"),
    ];

    campos_etl.forEach(function(campo){

        if(!campo.val()){
            campo.addClass("campo-invalido");
            const span_erro = $("span_erro");
            span_erro.html = (`Por favor preencha todos os campos`)
            valido = false;
        };

    });

    if(!valido){
        event.preventDefault();
        
    };

});

// retira a borda vermelha caso o campo seja selecionado denovo ou preenchido
$("input, textarea").on("input", function(){
    if($(this).val()){
        $(this).removeClass("campo-invalido");
    };
});

// variaveis p/: botão de listar package's, input "URL" e section onde será carregado os package's
const btn_package = $("#btn_package");
const url_package = $("#url_package");
const lista_package = $("#lista_package");

// função p/ busca e carregamento dos package's
function carregar_packages(){
    const url = url_package.val().trim();

    if (!url){
        alert(`Por favor insira uma URL valida`);
        return;
    };

    lista_package.html(`Carregando...`);

    //aqui ele vai buscar os package's
};

btn_package.on("click", carregar_packages);

