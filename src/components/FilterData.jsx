import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.jsx';
import './Styles.css/FilterTable.css'; // Asegúrate de crear este archivo con los estilos que te doy abajo

// Hook para detectar ancho de ventana
function useWindowWidth() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

export default function FilterTable() {
  const [data, setData] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [elementoSeleccionado, setElementoSeleccionado] = useState(null);
  const [totalRequerimiento, setTotalRequerimiento] = useState(0);
  const [totalHecho, setTotalHecho] = useState(0);
  const [totalRestan, setTotalRestan] = useState(0);

  const width = useWindowWidth();
  const isMobile = width < 768;

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const { data, error } = await supabase.from('control').select('*');
        if (error) throw error;
        setData(data);
        setResultados(data);

        const reqTotal = data.reduce((sum, item) => sum + (item.requerimiento || 0), 0);
        const hechoTotal = data.reduce((sum, item) => sum + (item.hecho || 0), 0);
        setTotalRequerimiento(reqTotal);
        setTotalHecho(hechoTotal);
        setTotalRestan(reqTotal - hechoTotal);
      } catch (error) {
        alert(error.message);
      }
    };
    fetchDatos();
  }, []);

  const handleChange = (e) => {
    setBusqueda(e.target.value);
    if (e.target.value === '') {
      setResultados(data);
    } else {
      const resultadoDeBusqueda = data.filter((elemento) =>
        elemento.producto.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setResultados(resultadoDeBusqueda);
    }
  };

  const eliminar = async (id) => {
    const userResponse = window.confirm('¿Seguro que quieres eliminar?');
    if (!userResponse) return;
    try {
      const { error } = await supabase.from('control').delete().eq('id', id);
      if (error) throw error;
      const newData = data.filter((item) => item.id !== id);
      setData(newData);
      setResultados(newData);

      const reqTotal = newData.reduce((sum, item) => sum + (item.requerimiento || 0), 0);
      const hechoTotal = newData.reduce((sum, item) => sum + (item.hecho || 0), 0);
      setTotalRequerimiento(reqTotal);
      setTotalHecho(hechoTotal);
      setTotalRestan(reqTotal - hechoTotal);
    } catch (error) {
      alert(error.message);
    }
  };

  const editar = (item) => {
    setElementoSeleccionado(item);
  };

  const actualizar = async (e) => {
    e.preventDefault();
    try {
      const { data: updatedData, error } = await supabase
        .from('control')
        .update({
          producto: elementoSeleccionado.producto,
          requerimiento: elementoSeleccionado.requerimiento,
          hecho: elementoSeleccionado.hecho,
          fecha: elementoSeleccionado.fecha
        })
        .eq('id', elementoSeleccionado.id)
        .select();

      if (error) throw error;

      const newData = data.map((item) =>
        item.id === updatedData[0].id ? updatedData[0] : item
      );

      setData(newData);
      setResultados(newData.filter((item) =>
        item.producto.toLowerCase().includes(busqueda.toLowerCase())
      ));
      setElementoSeleccionado(null);

      const reqTotal = newData.reduce((sum, item) => sum + (item.requerimiento || 0), 0);
      const hechoTotal = newData.reduce((sum, item) => sum + (item.hecho || 0), 0);
      setTotalRequerimiento(reqTotal);
      setTotalHecho(hechoTotal);
      setTotalRestan(reqTotal - hechoTotal);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="containerp">
      <div className="container">
        <h1>Lista de Datos</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={handleChange}
            className="search-input"
            aria-label="Buscar producto"
          />
        </div>

        {elementoSeleccionado && (
          <form onSubmit={actualizar} className="edit-form">
            <h3>Editar Elemento</h3>
            <div className="form-group">
              <label htmlFor="producto">Producto:</label>
              <input
                id="producto"
                type="text"
                value={elementoSeleccionado.producto}
                onChange={(e) => setElementoSeleccionado({
                  ...elementoSeleccionado,
                  producto: e.target.value
                })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="requerimiento">Requerimiento:</label>
              <input
                id="requerimiento"
                type="number"
                value={elementoSeleccionado.requerimiento}
                onChange={(e) => setElementoSeleccionado({
                  ...elementoSeleccionado,
                  requerimiento: Number(e.target.value)
                })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="hecho">Hecho:</label>
              <input
                id="hecho"
                type="number"
                value={elementoSeleccionado.hecho}
                onChange={(e) => setElementoSeleccionado({
                  ...elementoSeleccionado,
                  hecho: Number(e.target.value)
                })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fecha">Fecha:</label>
              <input
                id="fecha"
                type="date"
                value={elementoSeleccionado.fecha}
                onChange={(e) => setElementoSeleccionado({
                  ...elementoSeleccionado,
                  fecha: e.target.value
                })}
              />
            </div>
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => setElementoSeleccionado(null)}>
              Cancelar
            </button>
          </form>
        )}

        {isMobile ? (
          <div className="cards-container">
            {resultados.map((item) => (
              <div key={item.id} className="card">
                <h3>{item.producto}</h3>
                <p><b>Qty Total:</b> {item.requerimiento}</p>
                <p><b>Qty Parcial:</b> {item.hecho}</p>
                <p><b>Restan:</b> {item.requerimiento - item.hecho}</p>
                <p><b>Fecha:</b> {item.fecha}</p>
                <button onClick={() => editar(item)} aria-label={`Editar ${item.producto}`}>
                  Editar
                </button>
                <button onClick={() => eliminar(item.id)} aria-label={`Eliminar ${item.producto}`}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Qty Total</th>
                <th>Qty Parcial</th>
                <th>Restan</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((item) => (
                <tr key={item.id}>
                  <td>{item.producto}</td>
                  <td>{item.requerimiento}</td>
                  <td>{item.hecho}</td>
                  <td>{item.requerimiento - item.hecho}</td>
                  <td>{item.fecha}</td>
                  <td>
                    <button onClick={() => editar(item)}>Editar</button>
                    <button onClick={() => eliminar(item.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}
