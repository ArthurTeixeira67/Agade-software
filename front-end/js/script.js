console.log("Olá Agadê!")

const bt_listar = document.getElementById('bt-listar');
const input_package = document.getElementById('package');

bt_listar.addEventListener('click', async function buscar_package() {
    
    const input_url = input_package.value.trim();
    
    if(!input_url){

        alert("Por favor insira uma url valida!");
        return;
    }

    const url_obj = new URL(input_url);
    const api_base = url_obj.origin + '/api/3/action';
    
    try {
        
        const busca_lista = await fetch(`${api_base}/package_list`);
        const json_lista = await busca_lista.json()
        const package_id = json_lista.result;

        console.log(package_id)
        console.log("deu certo :)")

    } catch (error) {
        console.log("Deu ruim :(")
    }
});

// p/ testar a chamada do CKAN no input 'Url': https://demo.ckan.org