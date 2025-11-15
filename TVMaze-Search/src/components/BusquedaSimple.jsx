import React, { useState, useEffect, useRef } from "react";
import parse from "html-react-parser";
import { PiFunctionDuotone } from "react-icons/pi";

// const datosEjemplo = [
//   { id: 1, titulo: "Introducción a React" },
//   { id: 2, titulo: "Guía de Hooks de React" },
//   { id: 3, titulo: "Componentes con Vite" },
//   { id: 4, titulo: "Desarrollo Front-end" },
//   { id: 5, titulo: "Conceptos Básicos de JavaScript" },
// ];

async function searchQuery(query) {
  const result = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
  if (!result.ok) {
    throw new Error(`Error en la solicitud: ${result.statusText}`);
  }
  const data = await result.json();
  return data;
}

function BusquedaSimple() {
  const isInitialMount = useRef(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [seriesFavoritas, setSeriesFavoritas] = useState([]);

  const [serieElegida, setSerieElegida] = useState(null);
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
    searchQuery(terminoBusqueda).then((data) => {
      setResultados(data);
    });
  }, [terminoBusqueda]);

  const manejarCambio = (event) => {
    setTerminoBusqueda(event.target.value);
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
    // Detenemos el click para evitar que se abra el detalle (lo usaremos luego)
    event.stopPropagation();

    const nuevosFavoritos = seriesFavoritas.filter(
      (fav) => fav.show.id !== serieParaQuitar.show.id
    );
    setSeriesFavoritas(nuevosFavoritos);
  };

  return (
    <div className="busqueda-container">
      {serieElegida === null ? (
        <div>
          <h2>🔍 Encuentra tu serie favorita</h2>

          {/* ====== SECCIÓN DE FAVORITOS ====== */}
          <div className="favoritos-seccion" style={{ marginBottom: "30px" }}>
            <h3>⭐ Mis Series Favoritas</h3>
            {seriesFavoritas.length === 0 ? (
              <p>No has guardado ninguna serie todavía.</p>
            ) : (
              <ul className="list-none grid grid-cols-5 gap-2">
                {" "}
                {/* Un grid de 5 columnas */}
                {seriesFavoritas.map((fav) => (
                  <li
                    key={fav.show.id} // <-- Clave correcta
                    onClick={() => setSerieElegida(fav)} // <-- Abre el detalle
                    className="block border cursor-pointer relative" // <-- 'relative' para el botón
                  >
                    {/* Botón para quitar */}
                    <button
                      onClick={(e) => quitarDeFavoritos(e, fav)}
                      className="absolute top-0 right-0 bg-red-600 text-white p-1"
                      title="Quitar de favoritos"
                    >
                      X
                    </button>

                    {fav.show.image && <img src={fav.show.image.medium} />}
                    <p className="p-2">{fav.show.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Input de Búsqueda */}
          <input
            type="text"
            placeholder="Escribe tu término de búsqueda..."
            value={terminoBusqueda}
            onChange={manejarCambio} // Llama a la función al escribir
            style={{ padding: "10px", width: "300px", marginBottom: "20px" }}
          />

          {/* Resultados */}
          <h3>Resultados: ({resultados.length})</h3>
          {resultados.length === 0 ? (
            <p>No se encontraron resultados para "{terminoBusqueda}".</p>
          ) : (
            <ul className="list-none grid grid-cols-3">
              {/* Mapea y muestra cada resultado */}
              {resultados.map((item) => (
                <li
                  key={item.show.id}
                  onClick={() => setSerieElegida(item)}
                  className="block border cursor-pointer"
                >
                  <p>
                    {item.show.image && <img src={item.show.image.medium} />}
                  </p>
                  <p>{item.show.name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          {(() => {
            const yaEsFavorita = seriesFavoritas.some(
              (fav) => fav.show.id === serieElegida.show.id
            );

            return (
              <div className="flex bg-gray-100 p-4 justify-center gap-4">
                <button
                  onClick={() => {
                    setSerieElegida(null);
                  }}
                >
                  X
                </button>
                {yaEsFavorita ? (
                  <button
                    onClick={(e) => quitarDeFavoritos(e, serieElegida)}
                    className="bg-red-500 text-white p-2"
                  >
                    Quitar de Favoritos
                  </button>
                ) : (
                  <button
                    onClick={() => guardarEnFavoritos(serieElegida)}
                    className="bg-blue-500 text-white p-2"
                  >
                    Guardar en Favoritos
                  </button>
                )}
              </div>
            );
          })()}

          <h2>{serieElegida.show.name}</h2>
          {serieElegida.show.image && (
            <img src={serieElegida.show.image.medium} alt="Title image" />
          )}
          <div>
            <strong>Genero:</strong> {serieElegida.show.genres.join(", ")}
          </div>
          <div>
            <strong>Estado:</strong> {serieElegida.show.status}
          </div>
          <div>
            <strong>Duracion promedia:</strong>{" "}
            {serieElegida.show.averageRuntime || "N/A"}
          </div>
          <div>
            <strong>Estrenado:</strong> {serieElegida.show.premiered || "N/A"}
          </div>
          <div>
            <strong>Termino:</strong> {serieElegida.show.ended || "N/A"}
          </div>
          <div>
            <strong>Rating:</strong>{" "}
            {serieElegida.show.rating?.average || "N/A"}
          </div>
          {/* <div
            dangerouslySetInnerHTML={{ __html: serieElegida.show.summary }}
          /> */}
          {serieElegida.show.summary ? (
            <div>{parse(serieElegida.show.summary)}</div>
          ) : (
            <p>No hay resumen disponible</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BusquedaSimple;
