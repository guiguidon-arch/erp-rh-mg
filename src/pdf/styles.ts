import { StyleSheet } from '@react-pdf/renderer'

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 16,
    textAlign: 'center',
  },
  empresaNome: {
    fontSize: 12,
    fontWeight: 700,
  },
  titulo: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  secaoTitulo: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 6,
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  linha: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  campo: {
    flexDirection: 'row',
    flexGrow: 1,
    marginRight: 8,
  },
  label: {
    fontWeight: 700,
    marginRight: 4,
  },
  paragrafo: {
    marginBottom: 8,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  clausulaTitulo: {
    fontWeight: 700,
    marginTop: 8,
    marginBottom: 2,
  },
  table: {
    marginTop: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingVertical: 3,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 3,
    fontWeight: 700,
  },
  assinaturas: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assinaturaBloco: {
    width: '45%',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 4,
  },
  local: {
    marginTop: 24,
    marginBottom: 8,
  },
})
