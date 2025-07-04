import { useState } from 'react'
import { supabase } from '../lib/supabase.jsx' // Asegúrate que la importación sea correcta
import '../components/Styles.css/App.css'

function Control() {
  const [formData, setFormData] = useState({
    producto: "",
    requerimiento: "",
    hecho: "",
    fecha: ""
  })
 
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const { data, error } = await supabase
        .from('control')
        .insert([
          {
            producto: formData.producto,
            requerimiento: formData.requerimiento,
            hecho: formData.hecho,
            fecha: formData.fecha
          }
        ])
        .select()

      if (error) {
        throw error
      }

      // Resetear formulario
      setFormData({
        producto: "",
        requerimiento: "",
        hecho: "",
        fecha: ""
      })

      console.log("Datos insertados:", data)
      alert("Datos guardados correctamente!")
    } catch (error) {
      console.error("Error al insertar datos:", error.message)
      alert("Error al guardar los datos: " + error.message)
    }
  }

  return (
    <div className='containerp'>
      <div className='container'>
        <h1>Inventario de Produccion</h1>
        <a className='buttonList' href="../control.github.io/Lista">Ir a Listado de Productos</a>
        <form onSubmit={handleSubmit}>
          <label className='labelProduct'>
            Producto: 
            <input 
              className='inputForm'  
              placeholder='Nombre del producto' 
              onChange={handleChange}
              value={formData.producto}
              name="producto"
            
            />
          </label>  
          <label className='labelProduct'>
            Requerimiento: 
            <input 
              className='inputForm' 
              placeholder='Cantidad requerida' 
              onChange={handleChange}
              value={formData.requerimiento}
              name="requerimiento"
              
              type="number"
            />
          </label>
          <label className='labelProduct'>
            Hecho: 
            <input 
              className='inputForm' 
              placeholder='Cantidad producida' 
              onChange={handleChange}
              value={formData.hecho}
              name="hecho"
              required
              type="number"
            />
          </label>
          <label className='labelProduct'>
            Fecha: 
            <input 
              className='inputForm'  
              type='date'
              onChange={handleChange}
              value={formData.fecha}
              name="fecha"
              
            />
          </label>
          
          <button type="submit">Enviar</button>
        </form>
        
       
      </div>     
    </div>
  );
}

export default Control;