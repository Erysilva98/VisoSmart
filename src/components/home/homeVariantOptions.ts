export type HomeVariant = 1 | 2 | 3 | 4 | 5;

export const HOME_VARIANTS: { id: HomeVariant; name: string; description: string }[] = [
  { id: 1, name: 'Clean Balance', description: 'Saldo e próxima ação, sem distrações' },
  { id: 2, name: 'Saldo Visual', description: 'Proporção livre em destaque' },
  { id: 3, name: 'Aprender em Destaque', description: 'Aprendizado logo após o saldo' },
  { id: 4, name: 'Extrato em Destaque', description: 'Gastos e registro recente à vista' },
  { id: 5, name: 'Cartão Interativo', description: 'Resumo ilustrado e acolhedor' },
];
