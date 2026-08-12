export const EMPRESA = {
  razaoSocial: 'M & G EMPREENDIMENTOS LTDA',
  cnpj: '02.632.324/0001-78',
  endereco: 'Alameda Munique, 411 – Barueri/SP – CEP: 06475-250',
  enderecoCompleto: 'Alameda Munique, nº 411, Bairro Alphaville, Município de Barueri, Estado de São Paulo, CEP 06475-250',
  cidade: 'Barueri',
  telefone: '+55 (11) 4195-9529',
  email: 'mgemp@mgemp.com',
  cnae: '43.30-4-99',
  crea: '1139860',
  representante: {
    nome: 'Guilherme Moreira Guidon',
    cargo: 'Sócio Administrador',
    rg: '46.694.866-9',
    rgOrgaoEmissor: 'SSP/SP',
    cpf: '393.026.168-51',
    crea: '5070509486',
    nascimento: '16 de dezembro de 1989',
    nacionalidade: 'brasileiro',
    estadoCivil: 'casado',
    profissao: 'engenheiro civil',
    endereco: 'Alameda Munique, n.º 139, Bairro Alphaville, Município de Barueri, Estado de São Paulo, CEP 06475-250',
    email: 'guilherme@mgemp.com',
  },
  registro: {
    orgao: 'Junta Comercial do Estado de São Paulo – JUCESP',
    nire: '35.215.133.501',
    dataConstituicao: '05 de junho de 1998',
    ultimaAlteracao: 'sua 9ª e última alteração contratual registrada sob o nº 544.312/21-1, em 11 de novembro de 2021',
  },
  get razaoSocialCompleta() {
    return `${this.razaoSocial}., sociedade empresária limitada, com sede na ${this.enderecoCompleto}, inscrita no CNPJ/MF sob o nº ${this.cnpj}, atuante no ramo da construção civil, com atividade principal registrada sob o CNAE nº ${this.cnae}, devidamente registrada no CREA/SP sob o nº ${this.crea}, com endereço eletrônico ${this.email}, neste ato representada por seu ${this.representante.cargo.toLowerCase()}, ${this.representante.nome.toUpperCase()}, ${this.representante.nacionalidade}, ${this.representante.estadoCivil}, ${this.representante.profissao}, nascido em ${this.representante.nascimento}, portador da cédula de identidade RG nº ${this.representante.rg}, expedida pela ${this.representante.rgOrgaoEmissor}, inscrito no CPF/MF sob nº ${this.representante.cpf}, inscrito no CREA/SP sob o nº ${this.representante.crea}, residente e domiciliado na ${this.representante.endereco}, com endereço eletrônico ${this.representante.email}, conforme poderes conferidos pelo Contrato Social arquivado na ${this.registro.orgao}, sob o NIRE nº ${this.registro.nire}, registrado em sessão de ${this.registro.dataConstituicao}, com ${this.registro.ultimaAlteracao}, doravante denominada "EMPRESA CONTRATANTE"`
  },
}
