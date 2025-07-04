import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 20,
        fontSize: 12,
        backgroundColor: '#E4E4E4'
    },
    header: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333'
    },
    section: {
        margin: 10,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 4,
        marginBottom: 10
    },
    productTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#2c3e50'
    },
    productInfo: {
        fontSize: 10,
        marginBottom: 3,
        color: '#555'
    },
    completedBadge: {
        fontSize: 10,
        color: 'green',
        fontWeight: 'bold'
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        textAlign: 'center',
        fontSize: 10,
        color: '#666'
    }
});

function PDF({ data = [] }) {
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>
                    Reporte de Control de Producción
                </Text>
                
                <Text style={styles.productInfo}>
                    Fecha: {currentDate}
                </Text>
                
                <Text style={styles.productInfo}>
                    Total de productos: {data.length}
                </Text>
                
                {data.length > 0 ? (
                    data.map((item, index) => {
                        const resta = (item.requerimiento || 0) - (item.hecho || 0);
                        return (
                            <View key={index} style={styles.section}>
                                <Text style={styles.productTitle}>
                                    {item.producto || 'Producto sin nombre'}
                                </Text>
                                <Text style={styles.productInfo}>
                                    Cantidad Total: {item.requerimiento || 0}
                                </Text>
                                <Text style={styles.productInfo}>
                                    Cantidad Hecha: {item.hecho || 0}
                                </Text>
                                <Text style={styles.productInfo}>
                                    Cantidad Restante: {resta}
                                </Text>
                                <Text style={styles.productInfo}>
                                    Fecha: {item.fecha || 'Sin fecha'}
                                </Text>
                                {resta === 0 && (
                                    <Text style={styles.completedBadge}>
                                        ✅ COMPLETADO
                                    </Text>
                                )}
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.section}>
                        <Text style={styles.productInfo}>
                            No hay datos disponibles para mostrar
                        </Text>
                    </View>
                )}
                
                <Text style={styles.footer}>
                    Generado automáticamente - {currentDate}
                </Text>
            </Page>
        </Document>
    );
}

export default PDF;