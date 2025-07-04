import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.jsx';
import './Styles.css/FilterTable.css'; 
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDF from './PDF.jsx';

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
  const [showCompleted, setShowCompleted] = useState(false);

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

  //items completados
  const itemsCompletados = data.filter(item => {
    const resta = (item.requerimiento || 0) - (item.hecho || 0);
    return resta === 0;
  });

  // Componente del ícono PDF
  const PDFIcon = ({ item }) => {
    const resta = (item.requerimiento || 0) - (item.hecho || 0);
    
    if (resta !== 0) return null;
    
    return (
      <PDFDownloadLink 
        document={<PDF data={[item]} />} 
        fileName={`${item.producto}-completado-${new Date().toISOString().split('T')[0]}.pdf`}
        style={{ 
          display: 'inline-block',
          margin: '0 5px',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
      >
        {({ loading }) => (
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              padding: '5px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px',
              transform: loading ? 'scale(0.95)' : 'scale(1)'
            }}
            title="Descargar PDF - Producto Completado"
          >
            📄 {loading ? 'Generando...' : 'PDF'}
          </div>
        )}
      </PDFDownloadLink>
    );
  };

  // Modal  de productos completados
  const CompletedModal = () => {
    if (!showCompleted) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '80%',
          maxHeight: '80%',
          overflow: 'auto',
          position: 'relative'
        }}>
          <button 
            onClick={() => setShowCompleted(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
          
          <h2 style={{ marginBottom: '20px', color: '#28a745' }}>
            🎉 Productos Completados ({itemsCompletados.length})
          </h2>
          
          {itemsCompletados.length === 0 ? (
            <p>No hay productos completados aún.</p>
          ) : (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <PDFDownloadLink 
                  document={<PDF data={itemsCompletados} />} 
                  fileName={`todos-completados-${new Date().toISOString().split('T')[0]}.pdf`}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}
                >
                  {({ loading }) => (loading ? 'Generando PDF...' : '📄 Descargar PDF de Todos')}
                </PDFDownloadLink>
              </div>
              
              <div style={{ display: 'grid', gap: '15px' }}>
                {itemsCompletados.map((item, index) => (
                  <div key={item.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <h3 style={{ color: '#28a745', marginBottom: '10px' }}>
                      ✅ {item.producto}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                      <p><strong>Requerimiento:</strong> {item.requerimiento}</p>
                      <p><strong>Hecho:</strong> {item.hecho}</p>
                      <p><strong>Fecha:</strong> {item.fecha}</p>
                      <div>
                        <PDFDownloadLink 
                          document={<PDF data={[item]} />} 
                          fileName={`${item.producto}-${new Date().toISOString().split('T')[0]}.pdf`}
                          style={{ 
                            padding: '5px 10px', 
                            backgroundColor: '#28a745',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {({ loading }) => (loading ? 'Generando...' : '📄 Descargar PDF')}
                        </PDFDownloadLink>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="containerp">
      <div className="container">
        <h1>Lista de Datos</h1>

        
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <button 
              onClick={() => setShowCompleted(true)}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: itemsCompletados.length > 0 ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🎉 Ver Completados ({itemsCompletados.length})
            </button>
          </div>
        </div>

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
            {resultados.map((item) => {
              const resta = (item.requerimiento || 0) - (item.hecho || 0);
              return (
                <div key={item.id} className="card" style={{ backgroundColor: resta === 0 ? '#d4edda' : 'white' }}>
                  <h3>{item.producto}</h3>
                  <p><b>Qty Total:</b> {item.requerimiento}</p>
                  <p><b>Qty Parcial:</b> {item.hecho}</p>
                  <p style={{ color: resta === 0 ? 'green' : 'inherit', fontWeight: resta === 0 ? 'bold' : 'normal' }}>
                    <b>Restan:</b> {resta} {resta === 0 && '✅'}
                  </p>
                  <p><b>Fecha:</b> {item.fecha}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => editar(item)} aria-label={`Editar ${item.producto}`}>
                      Editar
                    </button>
                    <button onClick={() => eliminar(item.id)} aria-label={`Eliminar ${item.producto}`}>
                      Eliminar
                    </button>
                    <PDFIcon item={item} />
                  </div>
                </div>
              );
            })}
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
              {resultados.map((item) => {
                const resta = (item.requerimiento || 0) - (item.hecho || 0);
                return (
                  <tr key={item.id} style={{ backgroundColor: resta === 0 ? '#d4edda' : 'white' }}>
                    <td>{item.producto}</td>
                    <td>{item.requerimiento}</td>
                    <td>{item.hecho}</td>
                    <td style={{ color: resta === 0 ? 'green' : 'inherit', fontWeight: resta === 0 ? 'bold' : 'normal' }}>
                      {resta} {resta === 0 && '✅'}
                    </td>
                    <td>{item.fecha}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                        <button onClick={() => editar(item)}>Editar</button>
                        <button onClick={() => eliminar(item.id)}>Eliminar</button>
                        <PDFIcon item={item} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        
        <CompletedModal />
      </div>
    </div>
  );
}