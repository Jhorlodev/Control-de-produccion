
import { Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        fontSize: 12,
        display: 'flex',
        backgroundColor: '#E4E4E4'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
    }
});

function PDF() {
    return (
       <Document>
        <Page size="A4" style={styles.page}>
         <Text style={styles.section}>hola desde pdf</Text>
        </Page>
       </Document>
    );
}

export default PDF;
