import React, { useState, useEffect } from "react";
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
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [seriesFavoritas, setSeriesFavoritas] = useState([]);

  const [serieElegida, setSerieElegida] = useState(null);
  useEffect(() => {
    setSeriesFavoritas(JSON.parse(localStorage.getItem('misSeriesFavoritas')) || [])
  }, []);
  useEffect(() => {
    localStorage.setItem("misSeriesFavoritas", JSON.stringify(seriesFavoritas))
  }, [seriesFavoritas]);

  useEffect(() => {
    searchQuery(terminoBusqueda).then((data) => {
      setResultados(data);
    });
  }, [terminoBusqueda]);

  const manejarCambio = (event) => {
    setTerminoBusqueda(event.target.value);
  };

  return (
    <div className="busqueda-container">
      {serieElegida === null ? (
        <div>
          <h2>🔍 Encuentra tu serie favorita</h2>
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
                  key={item.id}
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
          <div className="flex bg-gray-100 p-4 justify-center gap-4">
            <button
              onClick={() => {
                setSerieElegida(null);
              }}
            >
              X
            </button>
            <h2>{serieElegida.show.name}</h2>
            <button onClick={() => setSeriesFavoritas([...seriesFavoritas, serieElegida])}>Save</button>
          </div>
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
            <strong>Tiempo promedio:</strong>{" "}
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
