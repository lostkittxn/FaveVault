document.addEventListener('DOMContentLoaded', () => {
    const botonesTipo = document.querySelectorAll('.botones-tipo button');
    const formularioBusqueda = document.getElementById('formulario-busqueda');
    const terminoBusquedaInput = document.getElementById('termino-busqueda');
    const botonBuscar = document.getElementById('buscar');
    const botonBorrarBusqueda = document.createElement('button');
    botonBorrarBusqueda.textContent = 'X';
    botonBorrarBusqueda.id = 'borrar-busqueda';
    formularioBusqueda.appendChild(botonBorrarBusqueda);
    const resultadosBusquedaDiv = document.getElementById('resultados-busqueda');
    const listaResultadosDiv = document.getElementById('lista-resultados');
    const listaFavoritosDiv = document.getElementById('lista-favoritos');
    const listaParaVerDiv = document.getElementById('lista-para-ver');
    const filtrosFavoritos = document.querySelector('.filtros-favoritos');
    const filtrosVerDespues = document.querySelector('.filtros-ver-despues');

    let tipoSeleccionado = null;
    let favoritos = [];
    let paraVerDespues = [];

    // Estilos para el botón de borrar búsqueda (naranja)
    botonBorrarBusqueda.style.padding = '8px 15px';
    botonBorrarBusqueda.style.cursor = 'pointer';
    botonBorrarBusqueda.style.border = '1px solid #cc6600';
    botonBorrarBusqueda.style.borderRadius = '5px';
    botonBorrarBusqueda.style.backgroundColor = '#ff9933';
    botonBorrarBusqueda.style.color = '#fff';
    botonBorrarBusqueda.style.fontSize = '0.9rem';
    botonBorrarBusqueda.style.textShadow = '0 1px 0 #993300';
    botonBorrarBusqueda.style.backgroundImage = 'linear-gradient(to bottom, #ffbb66, #ff8800)';
    botonBorrarBusqueda.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.5)';
    botonBorrarBusqueda.style.marginLeft = '5px';

    botonBorrarBusqueda.addEventListener('mouseover', () => {
        botonBorrarBusqueda.style.backgroundColor = '#ffaa55';
        botonBorrarBusqueda.style.backgroundImage = 'linear-gradient(to bottom, #ffcc88, #ffa022)';
    });

    botonBorrarBusqueda.addEventListener('mouseout', () => {
        botonBorrarBusqueda.style.backgroundColor = '#ff9933';
        botonBorrarBusqueda.style.backgroundImage = 'linear-gradient(to bottom, #ffbb66, #ff8800)';
    });

    // Cargar favoritos y lista "Para ver después" desde localStorage al cargar la página
    if (localStorage.getItem('favoritos')) {
        favoritos = JSON.parse(localStorage.getItem('favoritos'));
        mostrarFavoritos();
    }

    if (localStorage.getItem('paraVerDespues')) {
        paraVerDespues = JSON.parse(localStorage.getItem('paraVerDespues'));
        mostrarParaVerDespues();
    }

    botonesTipo.forEach(boton => {
        boton.addEventListener('click', function() {
            tipoSeleccionado = this.dataset.tipo;
            formularioBusqueda.style.display = 'flex';
            resultadosBusquedaDiv.style.display = 'none';
            listaResultadosDiv.innerHTML = '';
            terminoBusquedaInput.value = '';
        });
    });

    botonBuscar.addEventListener('click', buscarEnItunes);
    terminoBusquedaInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            buscarEnItunes();
        }
    });

    botonBorrarBusqueda.addEventListener('click', function() {
        terminoBusquedaInput.value = '';
        listaResultadosDiv.innerHTML = '';
        resultadosBusquedaDiv.style.display = 'none';
    });

    async function buscarEnItunes() {
        if (!tipoSeleccionado || !terminoBusquedaInput.value.trim()) {
            alert('Por favor, selecciona un tipo y escribe un término de búsqueda.');
            return;
        }

        const termino = encodeURIComponent(terminoBusquedaInput.value.trim());
        let entity = '';

        switch (tipoSeleccionado) {
            case 'movie':
                entity = 'movie';
                break;
            case 'book':
                entity = 'ebook';
                break;
            case 'album':
                entity = 'album';
                break;
        }

        const url = `https://itunes.apple.com/search?term=${termino}&entity=${entity}&limit=20&country=US`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            listaResultadosDiv.innerHTML = '';
            if (data.results && data.results.length > 0) {
                data.results.forEach(item => {
                    const resultadoItem = document.createElement('div');
                    resultadoItem.classList.add('resultado-item');

                    let titulo = '';
                    let artista = '';
                    let año = '';
                    let imagen = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb.jpg', '200x200bb.jpg') : 'placeholder.png';

                    if (tipoSeleccionado === 'movie') {
                        titulo = item.trackName;
                        artista = item.artistName;
                        año = item.releaseDate ? item.releaseDate.substring(0, 4) : 'N/A';
                    } else if (tipoSeleccionado === 'book') {
                        titulo = item.trackName;
                        artista = item.artistName;
                        año = item.releaseDate ? item.releaseDate.substring(0, 4) : 'N/A';
                        imagen = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb.jpg', '200x200bb.jpg') : 'placeholder_book.png';
                    } else if (tipoSeleccionado === 'album') {
                        titulo = item.collectionName;
                        artista = item.artistName;
                        año = item.releaseDate ? item.releaseDate.substring(0, 4) : 'N/A';
                        imagen = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb.jpg', '200x200bb.jpg') : 'placeholder_album.png';
                    }

                    resultadoItem.innerHTML = `
                    <img srcset="${item.artworkUrl60 ? item.artworkUrl60 : 'placeholder_small.png'} 60w,
                                  ${item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb.jpg', '200x200bb.jpg') : 'placeholder.png'} 200w"
                         sizes="(max-width: 600px) 60px, 200px"
                         src="${item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb.jpg', '200x200bb.jpg') : 'placeholder.png'}"
                         alt="${titulo}">
                    <p class="item-titulo">${titulo}</p>
                    <p class="item-detalle">${artista}</p>
                    <p class="item-detalle">${año}</p>
                    <div class="acciones-item">
                        <button class="agregar-favorito" data-id="${item.trackId || item.collectionId}" data-tipo="${tipoSeleccionado}" data-titulo="${titulo}" data-artista="${artista}" data-año="${año}" data-imagen="${imagen}">Favorito</button>
                        <button class="agregar-ver-despues" data-id="${item.trackId || item.collectionId}" data-tipo="${tipoSeleccionado}" data-titulo="${titulo}" data-artista="${artista}" data-año="${año}" data-imagen="${imagen}">Watchlist</button>
                    </div>
                `;
                    listaResultadosDiv.appendChild(resultadoItem);
                });
                resultadosBusquedaDiv.style.display = 'block';
            } else {
                listaResultadosDiv.innerHTML = '<p>No se encontraron resultados</p>';
                resultadosBusquedaDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Error al buscar en iTunes:', error);
            listaResultadosDiv.innerHTML = '<p>Ocurrió un error al buscar</p>';
            resultadosBusquedaDiv.style.display = 'block';
        }
    }

    function favoritoExiste(item) {
        return favoritos.some(fav => fav.id === item.id && fav.tipo === item.tipo);
    }

    function enListaParaVer(item) {
        return paraVerDespues.some(pvd => pvd.id === item.id && pvd.tipo === item.tipo);
    }

    function mostrarItems(lista, contenedor) {
        contenedor.innerHTML = '';
        lista.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add(contenedor === listaFavoritosDiv ? 'favorito-item' : 'ver-despues-item');
            itemDiv.innerHTML = `
                <img src="${item.imagen}" alt="${item.titulo}">
                <p class="item-titulo">${item.titulo}</p>
                <p class="item-detalle">${item.detalleAdicional}</p>
                ${item.año ? `<p class="item-detalle">${item.año}</p>` : ''}
                <button class="${contenedor === listaFavoritosDiv ? 'eliminar-favorito' : 'eliminar-ver-despues'}" data-id="${item.id}" data-tipo="${item.tipo}">Eliminar</button>
            `;
            contenedor.appendChild(itemDiv);
        });
    }

    function mostrarFavoritos(filtro = 'all') {
        const listaFiltrada = filtro === 'all' ? favoritos : favoritos.filter(item => item.tipo === filtro);
        mostrarItems(listaFiltrada, listaFavoritosDiv);

        filtrosFavoritos.querySelectorAll('button').forEach(button => {
            button.classList.remove('activo');
            if (button.dataset.filtro === filtro) {
                button.classList.add('activo');
            }
        });
    }

    function mostrarParaVerDespues(filtro = 'all') {
        const listaFiltrada = filtro === 'all' ? paraVerDespues : paraVerDespues.filter(item => item.tipo === filtro);
        mostrarItems(listaFiltrada, listaParaVerDiv);

        filtrosVerDespues.querySelectorAll('button').forEach(button => {
            button.classList.remove('activo');
            if (button.dataset.filtro === filtro) {
                button.classList.add('activo');
            }
        });
    }

    listaResultadosDiv.addEventListener('click', function(event) {
        if (event.target.classList.contains('agregar-favorito')) {
            const itemId = event.target.dataset.id;
            const tipo = event.target.dataset.tipo;
            const titulo = event.target.dataset.titulo;
            const artista = event.target.dataset.artista;
            const año = event.target.dataset.año;
            const imagen = event.target.dataset.imagen;

            const itemEncontrado = { id: itemId, tipo: tipo, imagen: imagen, titulo: titulo, detalleAdicional: artista, año: año };

            // Contar los favoritos del mismo tipo
            const favoritosDelTipo = favoritos.filter(fav => fav.tipo === tipo);

            if (favoritosDelTipo.length < 4 && !favoritoExiste(itemEncontrado)) {
                favoritos.push(itemEncontrado);
                guardarFavoritos();
                mostrarFavoritos(document.querySelector('.filtros-favoritos button.activo')?.dataset.filtro || 'all');
            } else if (favoritosDelTipo.length >= 4) {
                alert(`Ya has seleccionado 4 favoritos de tipo ${tipo}.`);
            } else if (favoritoExiste(itemEncontrado)) {
                alert('Este elemento ya está en tus favoritos.');
            }
        } else if (event.target.classList.contains('agregar-ver-despues')) {
            const itemId = event.target.dataset.id;
            const tipo = event.target.dataset.tipo;
            const titulo = event.target.dataset.titulo;
            const artista = event.target.dataset.artista;
            const año = event.target.dataset.año;
            const imagen = event.target.dataset.imagen;

            const itemEncontrado = { id: itemId, tipo: tipo, imagen: imagen, titulo: titulo, detalleAdicional: artista, año: año };

            if (!enListaParaVer(itemEncontrado)) {
                paraVerDespues.push(itemEncontrado);
                guardarParaVerDespues();
                mostrarParaVerDespues(document.querySelector('.filtros-ver-despues button.activo')?.dataset.filtro || 'all');
            } else if (enListaParaVer(itemEncontrado)) {
                alert('Este elemento ya está en tu lista de "Para ver después".');
            }
        }
    });

    filtrosFavoritos.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
            mostrarFavoritos(event.target.dataset.filtro);
        }
    });

    filtrosVerDespues.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
            mostrarParaVerDespues(event.target.dataset.filtro);
        }
    });

    listaFavoritosDiv.addEventListener('click', function(event) {
        if (event.target.classList.contains('eliminar-favorito')) {
            const itemId = event.target.dataset.id;
            const tipo = event.target.dataset.tipo;
            favoritos = favoritos.filter(fav => !(fav.id === itemId && fav.tipo === tipo));
            guardarFavoritos();
            mostrarFavoritos(document.querySelector('.filtros-favoritos button.activo')?.dataset.filtro || 'all');
        }
    });

    listaParaVerDiv.addEventListener('click', function(event) {
        if (event.target.classList.contains('eliminar-ver-despues')) {
            const itemId = event.target.dataset.id;
            const tipo = event.target.dataset.tipo;
            paraVerDespues = paraVerDespues.filter(pvd => !(pvd.id === itemId && pvd.tipo === tipo));
            guardarParaVerDespues();
            mostrarParaVerDespues(document.querySelector('.filtros-ver-despues button.activo')?.dataset.filtro || 'all');
        }
    });

    function guardarFavoritos() {
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
    }

    function guardarParaVerDespues() {
        localStorage.setItem('paraVerDespues', JSON.stringify(paraVerDespues));
    }
});