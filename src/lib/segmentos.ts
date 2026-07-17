export interface SegmentoItem {
  label: string;
  subitens?: string[];
}

export interface SegmentoCategoria {
  cat: string;
  itens: SegmentoItem[];
}

// Nichos locais/vocacionais de alta propensão de fechamento primeiro,
// categorias amplas/genéricas (e-commerce, moda) por último.
export const SEGMENTO_GRUPOS: SegmentoCategoria[] = [
  {
    cat: "🏥 Saúde e Bem-estar",
    itens: [
      { label: "Clínica Médica" },
      { label: "Odontologia" },
      { label: "Estética" },
      { label: "Salão de Beleza" },
      { label: "Academia" },
      { label: "Personal Trainer" },
      { label: "Pilates" },
      { label: "Psicologia" },
      { label: "Nutrição" },
      { label: "Farmácia" },
    ],
  },
  {
    cat: "🍔 Alimentação",
    itens: [
      { label: "Restaurante" },
      { label: "Churrascaria" },
      { label: "Lanchonete" },
      { label: "Bar e Boteco" },
      { label: "Delivery" },
      { label: "Buffet" },
      { label: "Padaria" },
      { label: "Confeitaria" },
      { label: "Café" },
    ],
  },
  {
    cat: "🛍️ Comércio Local",
    itens: [
      {
        label: "Loja Física",
        subitens: ["Moda e Vestuário", "Calçados", "Eletrônicos", "Pet Shop", "Presentes e Variedades", "Outro tipo de loja"],
      },
      { label: "Pet Shop" },
      { label: "Veterinário" },
    ],
  },
  {
    cat: "🏠 Imóveis e Construção",
    itens: [
      { label: "Imobiliária" },
      { label: "Corretor de Imóveis" },
      { label: "Construtora" },
      { label: "Reforma" },
      { label: "Arquitetura" },
      { label: "Design de Interiores" },
      { label: "Engenharia" },
      { label: "Incorporadora" },
    ],
  },
  {
    cat: "⚖️ Profissionais Liberais",
    itens: [
      { label: "Advocacia" },
      { label: "Contabilidade" },
      { label: "Consultoria Empresarial" },
      { label: "Recursos Humanos" },
    ],
  },
  {
    cat: "📚 Educação",
    itens: [
      { label: "Escola" },
      { label: "Curso Presencial" },
      { label: "Curso Online" },
      { label: "Infoproduto" },
      { label: "Coaching" },
      { label: "Mentoria" },
    ],
  },
  {
    cat: "🛒 E-commerce e Moda",
    itens: [
      {
        label: "E-commerce",
        subitens: ["Tênis", "Moda Feminina", "Moda Masculina", "Moda Íntima", "Eletrônicos", "Cosméticos e Beleza", "Casa e Decoração", "Infantil", "Outro nicho de e-commerce"],
      },
      {
        label: "Moda e Vestuário",
        subitens: ["Moda Feminina", "Moda Masculina", "Moda Íntima", "Moda Infantil", "Moda Plus Size", "Acessórios"],
      },
      { label: "Loja de Veículos" },
    ],
  },
  {
    cat: "💻 Tecnologia e Digital",
    itens: [
      { label: "Software e SaaS" },
      { label: "Agência de Marketing" },
      { label: "Desenvolvimento Web" },
      { label: "Freelancer" },
      { label: "Criador de Conteúdo" },
      { label: "Influenciador Digital" },
    ],
  },
  {
    cat: "🚀 Outros",
    itens: [
      { label: "Segurança e Vigilância" },
      { label: "Logística" },
      { label: "Transportadora" },
      { label: "Turismo" },
      { label: "Hotelaria e Pousada" },
      { label: "Eventos e Casamentos" },
      { label: "Energia Solar" },
      { label: "Franquia" },
      { label: "Indústria" },
      { label: "Agronegócio" },
      { label: "Outro" },
    ],
  },
];
