console.log("Olá Agadê!");

// guarda partes do html úteis para o programa em variáveis
const btn_listar = $("#bt-listar");
const input_url = $("#input-url");
const lista_package_resource = $("#lista-package-resource");
const busca_package = $(".busca-package");
const input_busca_package = $("#input-busca-package");

// array para salvar os packages carregados e variável para url
let packages_carregados = [];
let url = "";

// chama a função que carrega os packages
btn_listar.on("click", carregarPackages);

// função que carrega os packages
function carregarPackages() {
    // guarda a url digitada pelo usuário
    url = input_url.val();

    // verifica se o usuário digitou uma url
    if (!url) {
        alert("Por favor insira uma URL.");
        return;
    }

    // mensagem temporária enquanto carrega os packages
    lista_package_resource.html("<p>Carregando...</p>");

    // envia requisição para o php
    $.post(
        // envia a ação a ser feita e a url digitada
        "script.php",
        {
            acao: "listarPackages",
            url: url
        },

        function(resposta) {
            // guarda o resultado da requisição ckan
            packages_carregados = resposta.result;
            // monta os accordeons com o resultado e mostra a caixa de busca
            montarAccordion(resposta.result, url);
            busca_package.show();
        },

        // informa o js para tratar a resposta como json
        "json"

    // exibe mensagem de erro caso não consiga contatar o php
    ).fail(function(xhr, status, error) {
        console.log("Erro ao carregar packages");
        console.log(error);
        lista_package_resource.html(
            "<p>Erro ao carregar os packages.</p>"
        );
    });

}

function montarAccordion(package_ids, url) {
    // limpa o local que os accordions aparecem (caso haja uma outra requisição)
    lista_package_resource.empty();

    // cria e guarda a div dos accordions
    const accordion = $('<div id="accordion"></div>');

    // adiciona os accordions na pagina
    lista_package_resource.append(accordion);

    // para cada package carregado, pega o nome e o id
    package_ids.forEach(function(package_id) {
        const titulo = $(`
            <h3 data-id="${package_id}">
                <span>${package_id}</span>
            </h3>
        `);

        // conteudo dos accordions enquanto o php carrega os resources
        const conteudo = $(`
            <div>
                <p>Carregando resources...</p>
            </div>
        `);

        // adiciona o nome e o conteudo na div
        accordion.append(titulo);
        accordion.append(conteudo);
    });

    // configura como os accordions vão aparecer (fechados e do tamanho do conteúdo)
    $("#accordion").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content",

        // quando um accordion for aberto:
        activate: function(event, ui) {
            // salva seu id
            if (ui.newHeader.length) {
                const package_id =
                    ui.newHeader.data("id");
                // chama a função que carrega os resources
                carregarResources(
                    package_id,
                    ui.newPanel,
                    url
                );
            }
        }
    });
}

// função que carrega os resources do package selecionado
function carregarResources(package_id, painel, url) {
    // evita fazer a mesma requisição novamente
    if (painel.data("carregado")) {
        return;
    }

    // envia a requisição para o php
    $.post(
        // envia a ação, a url e o id do package selecionado
        "script.php",
        {
            acao: "packageShow",
            url: url,
            id: package_id
        },

        function(resposta) {
            console.log(resposta);

            if (!resposta.success) {
                painel.html(
                    "<p>Erro ao carregar os resources.</p>"
                );
                console.log(resposta.error);
                return;
            }

            const pkg = resposta.result;

            painel.empty();

            const botao = $(`
                <button type="button" class="btn-selecionar-todos">
                    Selecionar todos os resources
                </button>
            `);

            const lista = $("<ul></ul>");

            pkg.resources.forEach(function(resource) {
                //console.log(resource);
                
                lista.append(`
                    <li>
                        <input
                            type="checkbox"
                            name="resources[]"
                            value="${resource.id}"
                            data-package-id="${resource.package_id}"
                            data-url="${resource.url}"
                            data-nome="${resource.name}"
                            data-ultima-atualizacao="${resource.last_modified}"
                            data-delimitador=";">                            
                        <span>
                            ${resource.name} (${resource.format})
                        </span>
                    </li>
                `);
            });

            painel.append(botao);
            painel.append(lista);

            function atualizarBotao() {
                const checkboxes =
                    painel.find("input[type=checkbox]");
                const todosMarcados =
                    checkboxes.length > 0 &&
                    checkboxes.length ===
                    checkboxes.filter(":checked").length;

                botao.text(
                    todosMarcados
                        ? "Desmarcar todos os resources"
                        : "Selecionar todos os resources"
                );
            }

            botao.on("click", function() {
                const checkboxes =
                    painel.find("input[type=checkbox]");

                const todosMarcados =
                    checkboxes.length ===
                    checkboxes.filter(":checked").length;

                checkboxes.prop(
                    "checked",
                    !todosMarcados
                );

                atualizarBotao();
            });

            painel.find("input[type=checkbox]").on(
                "change",
                function() {
                    atualizarBotao();
                }
            );

            painel.data("carregado", true);

            $("#accordion").accordion("refresh");

        },

        "json"

    ).fail(function(xhr, status, error) {
        console.log("Erro ao carregar resources");
        console.log(error);

        painel.html(
            "<p>Erro ao carregar os resources.</p>"
        );
    });
}

input_busca_package.on("input", function() {
    const busca = $(this).val().toLowerCase().trim();

    const packages_filtrados = packages_carregados.filter(function(package_id) {
        return package_id.toLowerCase().includes(busca);
    });

    montarAccordion(packages_filtrados, url);
});

$("#submit").on("click", function(event) {

    event.preventDefault();

    const campos = [
        $("#id_base"),
        $("#nome"),
        $("#descricao"),
        $("#tabela_destino"),
        $("#fonte"),
        $("#fonte_link"),
        $("#fonte_api")
    ];

    let valido = true;

    campos.forEach(function(campo) {

        if (!campo.val().trim()) {
            campo.css("border", "2px solid red");
            valido = false;
        }

    });

    if (!valido) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    const dados = {
        id_base: $("#id_base").val(),
        nome: $("#nome").val(),
        descricao: $("#descricao").val(),
        tabela_destino: $("#tabela_destino").val(),
        fonte: $("#fonte").val(),
        fonte_link: $("#fonte_link").val(),
        fonte_api: $("#fonte_api").val(),
        resources: []
    };

    $("#lista-package-resource input[name='resources[]']:checked").each(function() {

        const checkbox = $(this);

        dados.resources.push({
            id_base: $("#id_base").val(),
            resource_id: checkbox.val(),
            package_id: checkbox.data("package-id"),
            url: checkbox.data("url"),
            nome: checkbox.data("nome"),
            ultima_atualizacao: checkbox.data("ultima-atualizacao").substring(0, 10),
            delimitador: ";"
        });

    });

    console.log(dados);

    $.post(
        "script.php",
        {
            acao: "criarBasesFontes",
            dados: JSON.stringify(dados)
        },
        function(resposta) {

            console.log(resposta);

            if (resposta.success) {
                alert("Base e fontes criadas com sucesso!");
            } else {
                alert("Erro ao criar base e fontes.");
                console.log(resposta.erro);
            }

        },
        "json"
    ).fail(function(xhr, status, error) {

        console.log("Erro ao enviar os dados");
        console.log("Status:", status);
        console.log("Erro:", error);
        console.log("Resposta do PHP:", xhr.responseText);

    });

});

$("#id_base, #nome, #descricao, #tabela_destino, #fonte, #fonte_link, #fonte_api").on("input", function() {

    if ($(this).val().trim()) {
        $(this).css("border", "");
    }
});