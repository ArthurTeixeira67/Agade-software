console.log("Olá Agadê!");

$("form").on("submit", function(event) {
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
        if (!campo.val().trim()) {
            campo.addClass("campo-invalido");
            valido = false;
        }
    });

    if (!valido) {
        event.preventDefault();
        alert("Preencha todos os campos obrigatórios.");
    }
});

$("form input, form textarea").on("input", function() {
    if ($(this).val().trim()) {
        $(this).removeClass("campo-invalido");
    }
});

const btn_listar = $("#bt-listar");
const input_url = $("#input-url");
const lista_package_resource = $("#lista-package-resource");

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
            montarAccordion(resposta.result, url);
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
                lista.append(`
                    <li>
                        <input
                            type="checkbox"
                            name="resources[]"
                            value="${resource.id}">

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