export const COUNTRIES = [
  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola",
  "Antigua-et-Barbuda", "Arabie saoudite", "Argentine", "Arménie", "Australie", "Autriche",
  "Azerbaïdjan", "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin",
  "Bhoutan", "Biélorussie", "Birmanie", "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil",
  "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cambodge", "Cameroun", "Canada",
  "Cap-Vert", "République centrafricaine", "Chili", "Chine", "Chypre", "Colombie", "Comores",
  "Congo", "République démocratique du Congo", "Corée du Nord", "Corée du Sud", "Costa Rica",
  "Côte d'Ivoire", "Croatie", "Cuba", "Danemark", "Djibouti", "Dominique", "Égypte",
  "Émirats arabes unis", "Équateur", "Érythrée", "Espagne", "Estonie", "Eswatini",
  "États-Unis", "Éthiopie", "Fidji", "Finlande", "France", "Gabon", "Gambie", "Géorgie",
  "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée", "Guinée-Bissau", "Guinée équatoriale",
  "Guyana", "Haïti", "Honduras", "Hongrie", "Îles Marshall", "Îles Salomon", "Inde",
  "Indonésie", "Irak", "Iran", "Irlande", "Islande", "Israël", "Italie", "Jamaïque",
  "Japon", "Jordanie", "Kazakhstan", "Kenya", "Kirghizistan", "Kiribati", "Kosovo",
  "Koweït", "Laos", "Lesotho", "Lettonie", "Liban", "Liberia", "Libye", "Liechtenstein",
  "Lituanie", "Luxembourg", "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi",
  "Maldives", "Mali", "Malte", "Maroc", "Maurice", "Mauritanie", "Mexique", "Micronésie",
  "Moldavie", "Monaco", "Mongolie", "Monténégro", "Mozambique", "Namibie", "Nauru",
  "Népal", "Nicaragua", "Niger", "Nigéria", "Norvège", "Nouvelle-Zélande", "Oman",
  "Ouganda", "Ouzbékistan", "Pakistan", "Palaos", "Palestine", "Panama",
  "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou", "Philippines", "Pologne",
  "Portugal", "Qatar", "Roumanie", "Royaume-Uni", "Russie", "Rwanda", "Saint-Christophe-et-Niévès",
  "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Sainte-Lucie", "Salvador", "Samoa",
  "Sao Tomé-et-Principe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour",
  "Slovaquie", "Slovénie", "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède",
  "Suisse", "Suriname", "Syrie", "Tadjikistan", "Tanzanie", "Tchad", "Tchéquie",
  "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie",
  "Turkménistan", "Turquie", "Tuvalu", "Ukraine", "Uruguay", "Vanuatu", "Vatican",
  "Venezuela", "Vietnam", "Yémen", "Zambie", "Zimbabwe",
];

export const MAX_MEDIA_FILES = 6;
export const MAX_IMAGE_MB = 8;
export const MAX_VIDEO_MB = 50;

export const SERVICE_CATEGORIES = [
  "Bricolage & réparation",
  "Cours & formation",
  "Beauté & bien-être",
  "Informatique",
  "Déménagement",
  "Événementiel",
];

export const PRODUIT_CATEGORIES = [
  "Mode & accessoires",
  "Maison & déco",
  "Électronique",
  "Enfants & bébé",
  "Sport & loisirs",
  "Véhicules",
];

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "à l'instant";
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
