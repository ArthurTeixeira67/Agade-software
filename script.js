console.log("Olá Agadê!");

const btn_listar = $("#bt-listar");
const input_url = $("#input-url");
const lista_package_resource = $("#lista-package-resource");
const busca_package = $(".busca-package");
const input_busca_package = $("#input-busca-package");
let packages_carregados = [];
let url_atual = "";

btn_listar.on("click", carregarPackages);

function carregarPackages() {
    const url = input_url.val().trim();

    if (!url) {
        alert("Por favor insira uma URL.");
        return;
    }

    lista_package_resource.html("<p>Carregando...</p>");

    $.post(
        "script.php",
        {
            acao: "listarPackages",
            url: url
        },

        function(resposta) {
            packages_carregados = resposta.result;
            url_atual = url;
            montarAccordion(resposta.result, url);
            busca_package.show();
        },

        "json"

    ).fail(function(xhr, status, error) {
        console.log("Erro ao carregar packages");
        console.log(error);
        lista_package_resource.html(
            "<p>Erro ao carregar os packages.</p>"
        );
    });

}

function montarAccordion(package_ids, url) {
    lista_package_resource.empty();

    const accordion = $('<div id="accordion"></div>');

    lista_package_resource.append(accordion);

    package_ids.forEach(function(package_id) {
        const titulo = $(`
            <h3 data-id="${package_id}">
                <span>${package_id}</span>
            </h3>
        `);

        const conteudo = $(`
            <div>
                <p>Carregando resources...</p>
            </div>
        `);

        accordion.append(titulo);
        accordion.append(conteudo);
    });

    $("#accordion").accordion({
        collapsible: true,
        active: false,
        heightStyle: "content",

        activate: function(event, ui) {
            if (ui.newHeader.length) {
                const package_id =
                    ui.newHeader.data("id");

                carregarResources(
                    package_id,
                    ui.newPanel,
                    url
                );
            }
        }
    });
}

function carregarResources(package_id, painel, url) {
    if (painel.data("carregado")) {
        return;
    }

    $.post(
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
                console.log(resource);
                
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

    montarAccordion(packages_filtrados, url_atual);
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
            resource_id: checkbox.val(),
            package_id: checkbox.data("package-id"),
            url: checkbox.data("url"),
            nome: checkbox.data("nome"),
            ultima_atualizacao: checkbox.data("ultima-atualizacao").substring(0, 10),
            delimitador: checkbox.data("delimitador")
        });

    });

    console.log(dados);

});

$("#id_base, #nome, #descricao, #tabela_destino, #fonte, #fonte_link, #fonte_api").on("input", function() {

    if ($(this).val().trim()) {
        $(this).css("border", "");
    }
});