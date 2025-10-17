const { buildEmpreendimentoPath } = require('../lib/urls');
const { getSeededSuggestions } = require('../lib/suggestions');

const sample = {
  id: 'abc123',
  nome: 'Residencial Meia Praia',
  cidade: 'Itapema',
  estado: 'SC',
  tipo: 'Apartamentos',
  status: 'entregue',
  bairro: 'Meia Praia'
};

console.log('Empreendimento slug:', buildEmpreendimentoPath(sample));
console.log('Sugestoes (first 5):', getSeededSuggestions().slice(0,5));
