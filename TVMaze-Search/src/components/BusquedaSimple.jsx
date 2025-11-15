import React, { useState } from 'react';

const datosEjemplo = [
  { id: 1, titulo: "Introducción a React" },
  { id: 2, titulo: "Guía de Hooks de React" },
  { id: 3, titulo: "Componentes con Vite" },
  { id: 4, titulo: "Desarrollo Front-end" },
  { id: 5, titulo: "Conceptos Básicos de JavaScript" },
];

function BusquedaSimple() {
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    const resultadosFiltrados = datosEjemplo.filter(item =>
        item.titulo.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );


    const manejarCambio = (event) => {
        setTerminoBusqueda(event.target.value);
    };

    return (
        <div className="busqueda-container">
        <h2>🔍 Página de Búsqueda Simple</h2>
      
      {/* Input de Búsqueda */}
      <input
        type="text"
        placeholder="Escribe tu término de búsqueda..."
        value={terminoBusqueda}
        onChange={manejarCambio} // Llama a la función al escribir
        style={{ padding: '10px', width: '300px', marginBottom: '20px' }}
      />
      
      {/* Resultados */}
      <h3>Resultados: ({resultadosFiltrados.length})</h3>
      {resultadosFiltrados.length === 0 ? (
        <p>No se encontraron resultados para "{terminoBusqueda}".</p>
      ) : (
        <ul>
          {/* Mapea y muestra cada resultado */}
          {resultadosFiltrados.map(item => (
            <li key={item.id} style={{ marginBottom: '5px' }}>
              {item.titulo}
            </li>
          ))}
        </ul>
      )}
    </div>
    );
}

export default BusquedaSimple;