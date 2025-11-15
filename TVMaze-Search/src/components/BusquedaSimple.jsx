import { useState, useEffect, useRef } from "react";
import parse from "html-react-parser";
import "./BusquedaSimple.css"; // <-- ¡IMPORTA TU NUEVO CSS!

async function searchQuery(query) {
  const result = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
  if (!result.ok) {
    throw new Error(`Error en la solicitud: ${result.statusText}`);
  }
  const data = await result.json();
  return data;
}

async function getShowDetails(id) {
  const result = await fetch(`https://api.tvmaze.com/shows/${id}`);
  if (!result.ok) {
    throw new Error(`Error en la solicitud: ${result.statusText}`);
  }
  const data = await result.json();
  return data;
}

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function BusquedaSimple() {
  const isInitialMount = useRef(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [seriesFavoritas, setSeriesFavoritas] = useState([]);
  const terminoDebounced = useDebounce(terminoBusqueda, 400);

  const [serieElegida, setSerieElegida] = useState(null);
  const [detalleSerie, setDetalleSerie] = useState(null);
  const [isLoadingDetalle, setIsLoadingDetalle] = useState(false);
  const [showFavoritas, setShowFavoritas] = useState(false);
  useEffect(() => {
    setSeriesFavoritas(
      JSON.parse(localStorage.getItem("misSeriesFavoritas")) || []
    );
  }, []);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      localStorage.setItem(
        "misSeriesFavoritas",
        JSON.stringify(seriesFavoritas)
      );
    }
  }, [seriesFavoritas]);

  useEffect(() => {
    if (terminoDebounced) {
      searchQuery(terminoDebounced).then((data) => {
        setResultados(data);
      });
    }
  }, [terminoDebounced]);

  useEffect(() => {
    // Si hay una serie elegida, buscamos sus detalles completos
    if (serieElegida) {
      setIsLoadingDetalle(true);
      setDetalleSerie(null); // Limpiamos detalles anteriores

      getShowDetails(serieElegida.show.id)
        .then((data) => {
          setDetalleSerie(data); // Guardamos los nuevos detalles completos
        })
        .catch((error) => {
          console.error("Error al cargar detalles:", error);
          // Aquí podrías setear un estado de error para mostrarlo
        })
        .finally(() => {
          setIsLoadingDetalle(false);
        });
    }
  }, [serieElegida]);

  const manejarCambio = (event) => {
    setTerminoBusqueda(event.target.value);
  };

  const manejarCambioShowFavs = (event) => {
    setShowFavoritas(event.target.checked);
  };

  const guardarEnFavoritos = (serieParaGuardar) => {
    const yaExiste = seriesFavoritas.some(
      (fav) => fav.show.id === serieParaGuardar.show.id
    );
    if (!yaExiste) {
      setSeriesFavoritas([...seriesFavoritas, serieParaGuardar]);
    }
  };

  const quitarDeFavoritos = (event, serieParaQuitar) => {
    event.stopPropagation();

    const nuevosFavoritos = seriesFavoritas.filter(
      (fav) => fav.show.id !== serieParaQuitar.show.id
    );
    setSeriesFavoritas(nuevosFavoritos);
  };

  return (
    <div className="busqueda-container">
      {serieElegida === null ? (
        <div className="vista-busqueda">
          <h2>🔍 Encuentra tu serie favorita</h2>

          {/* ====== SECCIÓN DE FAVORITOS ====== */}
          <h3>
            ⭐ Mis Series Favoritas
            <input
              type="checkbox"
              checked={showFavoritas}
              name="showFavs"
              id="showFavsCheckbox"
              onChange={manejarCambioShowFavs}
            />
          </h3>
          {showFavoritas && (
            <div className="favoritos-seccion">
              {seriesFavoritas.length === 0 && showFavoritas ? (
                <p className="estado-vacio">
                  No has guardado ninguna serie todavía.
                </p>
              ) : (
                <ul className="lista-series favoritos-grid">
                  {seriesFavoritas.map((fav) => (
                    <li
                      key={fav.show.id}
                      onClick={() => setSerieElegida(fav)}
                      className="serie-card favorito-card"
                    >
                      {/* Botón para quitar */}
                      <button
                        onClick={(e) => quitarDeFavoritos(e, fav)}
                        className="btn-quitar-fav"
                        title="Quitar de favoritos"
                      >
                        &times; {/* Un 'X' más elegante */}
                      </button>

                      {fav.show.image && (
                        <img src={fav.show.image.medium} alt={fav.show.name} />
                      )}
                      <p>{fav.show.name}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Input de Búsqueda */}
          <input
            type="text"
            placeholder="Escribe tu término de búsqueda..."
            value={terminoBusqueda}
            onChange={manejarCambio}
            className="input-busqueda"
          />

          {/* Resultados */}
          <h3>Resultados: ({resultados.length})</h3>
          {resultados.length === 0 && terminoBusqueda ? (
            <p className="estado-vacio">
              No se encontraron resultados para "{terminoBusqueda}".
            </p>
          ) : (
            <ul className="lista-series resultados-grid">
              {resultados.map((item) => (
                <li
                  key={item.show.id}
                  onClick={() => setSerieElegida(item)}
                  className="serie-card resultado-card"
                >
                  {item.show.image && (
                    <img src={item.show.image.original} alt={item.show.name} />
                  )}
                  <p>{item.show.name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="vista-detalle">
          {(() => {
            const yaEsFavorita = seriesFavoritas.some(
              (fav) => fav.show.id === serieElegida.show.id
            );

            return (
              <div className="detalle-controles">
                <button
                  onClick={() => {
                    setSerieElegida(null);
                    setDetalleSerie(null);
                  }}
                  className="btn-detalle btn-cerrar-detalle"
                  title="Cerrar vista de detalle"
                >
                  &times; Volver a la búsqueda
                </button>
                {yaEsFavorita ? (
                  <button
                    onClick={(e) => quitarDeFavoritos(e, serieElegida)}
                    className="btn-detalle btn-accion btn-quitar"
                  >
                    Quitar de Favoritos
                  </button>
                ) : (
                  <button
                    onClick={() => guardarEnFavoritos(serieElegida)}
                    className="btn-detalle btn-accion btn-guardar"
                  >
                    Guardar en Favoritos
                  </button>
                )}
              </div>
            );
          })()}

          {isLoadingDetalle && (
            <p className="estado-vacio">Cargando detalles...</p>
          )}

          {/* Contenido del detalle estructurado para layout responsivo */}
          {!isLoadingDetalle && detalleSerie && (
            <div className="detalle-contenido">
              <div className="detalle-col-izquierda">
                {detalleSerie.image && (
                  <img
                    src={detalleSerie.image.original}
                    alt={detalleSerie.name}
                  />
                )}
              </div>

              <div className="detalle-col-derecha">
                <h2>{detalleSerie.name}</h2>
                <div className="detalle-info">
                  <div>
                    <strong>Genero:</strong>{" "}
                    {detalleSerie.genres.join(", ") || "N/A"}
                  </div>
                  <div>
                    <strong>Estado:</strong> {detalleSerie.status || "N/A"}
                  </div>
                  <div>
                    <strong>Duracion promedia:</strong>{" "}
                    {detalleSerie.averageRuntime
                      ? `${detalleSerie.averageRuntime} min`
                      : "N/A"}
                  </div>
                  <div>
                    <strong>Estrenado:</strong>{" "}
                    {detalleSerie.premiered || "N/A"}
                  </div>
                  <div>
                    <strong>Termino:</strong> {detalleSerie.ended || "N/A"}
                  </div>
                  <div>
                    <strong>Rating:</strong>{" "}
                    {detalleSerie.rating?.average || "N/A"}
                  </div>
                </div>

                {detalleSerie.summary ? (
                  <div className="detalle-summary">
                    {parse(detalleSerie.summary)}
                  </div>
                ) : (
                  <p>No hay resumen disponible</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BusquedaSimple;
