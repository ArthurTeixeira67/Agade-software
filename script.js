console.log("Olá Agade!")

const btn_listar             = $('#bt-listar');
const input_url              = $('#input-url');
const lista_package_resource = $('#lista-package-resource');

btn_listar.on('click', async function listar() {

    const url = input_url.val().trim();

    if (!url) {
        alert("Por favor insira uma URL");
        return;
    }

    lista_package_resource.html('<p>Carregando...</p>');

    try {
        const busca_lista = await fetch(
            `script.php?acao=listarPackages&url=${encodeURIComponent(url)}`
        );
        const json_lista  = await busca_lista.json();
        const package_ids = json_lista.result;

        lista_package_resource.empty();
        const accordion_el = $('<div id="accordion"></div>');
        lista_package_resource.append(accordion_el);

        for(const pkg_id of package_ids){

            const busca_detalhes = await fetch(
                `script.php?acao=packageShow&url=${encodeURIComponent(url)}&id=${encodeURIComponent(pkg_id)}`
            );
            const json_detalhes  = await busca_detalhes.json();
            const pkg            = json_detalhes.result;

            const titulo = $(`
                <h3>
                    <span>${pkg.title}</span>
                </h3>
            `);

            const conteudo = $(`
                <div>
                    <button type="button" class="btn-selecionar-todos">Selecionar todos os resources</button>
                    <ul>
                        ${pkg.resources.map(r => `
                            <li>
                                <input type="checkbox" name="resources[]" value="${r.id}">
                                <span class="resource-nome">${r.name} (${r.format})</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `);

            conteudo.find('.btn-selecionar-todos').on('click', function(){
                const btn_todos      = $(this);
                const checkboxes     = conteudo.find('input[type=checkbox]');
                const todos_marcados = checkboxes.length === checkboxes.filter(':checked').length;

                checkboxes.prop('checked', !todos_marcados);
                btn_todos.text(todos_marcados ? 'Selecionar todos' : 'Desmarcar todos');
            });

            accordion_el.append(titulo);
            accordion_el.append(conteudo);

        }

        $('#accordion').accordion({
            collapsible: true,
            active: false
        });

        console.log(package_ids);
        console.log("deu certo :)");

    } catch (error) {
        console.log("deu ruim!");
        console.log(error.message);
    }
});

// p/ testar a chamada do CKAN no input 'Url': https://demo.ckan.org