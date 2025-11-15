import React, { useState, useEffect } from "react";
import parse from 'html-react-parser';

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

  const [serieElegida, setSerieElegida] = useState(null);

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
          <h2>🔍 Página de Búsqueda Simple</h2>
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
            <ul>
              {/* Mapea y muestra cada resultado */}
              {resultados.map((item) => (
                <li
                  key={item.id}
                  style={{ marginBottom: "5px" }}
                  onClick={() => setSerieElegida(item)}
                >
                  {item.show.name}
                  <img src={item.show.image.medium} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              setSerieElegida(null);
            }}
          >
            X
          </button>
          <h2>{serieElegida.show.name}</h2>
          <div>
            Genero:{" "}
            {
              // <>
              // {serieElegida.show.genres.map((genero) => (
              //   <p>, {genero}</p>
              // ))}
              // </>
              serieElegida.show.genres.join(", ")
            }
          </div>
          <div>Estado: {serieElegida.show.status}</div>
          <div>Tiempo promedio: {serieElegida.show.averageRuntime}</div>
          <div>Estrenado: {serieElegida.show.premiered}</div>
          <div>Termino: {serieElegida.show.ended}</div>
          <div>Rating: {serieElegida.show.rating.average}</div>
          {/* <div
            dangerouslySetInnerHTML={{ __html: serieElegida.show.summary }}
          /> */}
          <div>{parse(serieElegida.show.summary)}</div>
        </div>
      )}
    </div>
  );
}

export default BusquedaSimple;
