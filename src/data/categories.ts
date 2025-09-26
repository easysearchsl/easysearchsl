export type CategoryNode = {
  label: string;
  value: string; // unique id/path-friendly value
  children?: CategoryNode[];
};

// Hierarchical business categories
// Note: Update/extend as needed for your domain.
export const categoryTree: CategoryNode[] = [
  // A – C
  { label: "Agriculture & Farming", value: "agriculture-farming" },
  { label: "Arts & Entertainment", value: "arts-entertainment" },
  {
    label: "Automotive",
    value: "automotive",
    children: [
      { label: "Car Dealer", value: "automotive/car-dealer" },
      { label: "Car Wash", value: "automotive/car-wash" },
      { label: "Mechanic", value: "automotive/mechanic" },
    ],
  },
  { label: "Aviation", value: "aviation" },
  {
    label: "Beauty & Wellness",
    value: "beauty-wellness",
    children: [
      { label: "Beauty & Spa", value: "beauty-wellness/beauty-spa" },
      { label: "Cosmetic", value: "beauty-wellness/cosmetic" },
      { label: "Fashion & Clothing", value: "beauty-wellness/fashion-clothing" },
      { label: "Saloon", value: "beauty-wellness/saloon" },
    ],
  },
  { label: "Community-Based Organization – CBO", value: "community-based-organization-cbo" },
  { label: "Construction", value: "construction" },
  { label: "Construction & Building Service", value: "construction-building-service" },

  // D – G
  {
    label: "Education & Training",
    value: "education-training",
    children: [
      { label: "College", value: "education-training/college" },
      { label: "Driving School", value: "education-training/driving-school" },
      { label: "School", value: "education-training/school" },
      { label: "University", value: "education-training/university" },
      { label: "Vocational & Training Centre", value: "education-training/vocational-training-centre" },
    ],
  },
  { label: "Event Planning & Service", value: "event-planning-service" },
  { label: "Factory", value: "factory" },
  {
    label: "Financial Institution",
    value: "financial-institution",
    children: [
      { label: "Bank", value: "financial-institution/bank" },
      { label: "Microfinance", value: "financial-institution/microfinance" },
    ],
  },
  { label: "Foreign Exchange", value: "foreign-exchange" },
  { label: "Gas Stations", value: "gas-stations" },
  {
    label: "Government Office",
    value: "government-office",
    children: [
      { label: "Agency", value: "government-office/agency" },
      { label: "Commission", value: "government-office/commission" },
      { label: "Corporation", value: "government-office/corporation" },
      { label: "Ministry", value: "government-office/ministry" },
    ],
  },

  // H – M
  {
    label: "HealthCare & Medical",
    value: "healthcare-medical",
    children: [
      { label: "Beauty & Personal Care", value: "healthcare-medical/beauty-personal-care" },
      { label: "Clinic", value: "healthcare-medical/clinic" },
      { label: "Community Health Centre", value: "healthcare-medical/community-health-centre" },
      { label: "Dental Care", value: "healthcare-medical/dental-care" },
      { label: "Emergency Service", value: "healthcare-medical/emergency-service" },
      { label: "Hospital", value: "healthcare-medical/hospital" },
      { label: "Pharmacy", value: "healthcare-medical/pharmacy" },
      { label: "Sports, Gym & Fitness", value: "healthcare-medical/sports-gym-fitness" },
    ],
  },
  { label: "Hotel & Accommodation", value: "hotel-accommodation" },
  { label: "Hub (Community)", value: "hub-community" },
  { label: "Import & Export", value: "import-export" },
  { label: "Internet Service Provider – ISP", value: "internet-service-provider-isp" },
  { label: "Legal Service / Law", value: "legal-service-law" },
  { label: "Marketing & Advertising Service", value: "marketing-advertising-service" },
  {
    label: "Media",
    value: "media",
    children: [
      { label: "Multimedia", value: "media/multimedia" },
      { label: "Newspaper & Magazine", value: "media/newspaper-magazine" },
      { label: "Radio & TV", value: "media/radio-tv" },
    ],
  },
  { label: "Mining", value: "mining" },

  // N – S
  { label: "Non-Profit Organization – NGO", value: "non-profit-organization-ngo" },
  {
    label: "Professional Services",
    value: "professional-services",
    children: [
      { label: "Accounting", value: "professional-services/accounting" },
      { label: "Cleaning", value: "professional-services/cleaning" },
      { label: "Consulting", value: "professional-services/consulting" },
      { label: "General Service", value: "professional-services/general-service" },
      { label: "Land Agent", value: "professional-services/land-agent" },
      { label: "Logistic", value: "professional-services/logistic" },
      { label: "Marketing", value: "professional-services/marketing" },
      { label: "Photography & Videography Service", value: "professional-services/photography-videography-service" },
      { label: "Repair", value: "professional-services/repair" },
    ],
  },
  { label: "Real Estate", value: "real-estate" },
  { label: "Religious Organization", value: "religious-organization" },
  { label: "Shopping", value: "shopping" },
  { label: "Shop", value: "shop" },
  {
    label: "Social Places",
    value: "social-places",
    children: [
      { label: "Bakery", value: "social-places/bakery" },
      { label: "Bar & Lounge", value: "social-places/bar-lounge" },
      { label: "Cafes", value: "social-places/cafes" },
      { label: "Catering", value: "social-places/catering" },
      { label: "Food & Beverage", value: "social-places/food-beverage" },
      { label: "Night Club", value: "social-places/night-club" },
      { label: "Restaurants & Cafe", value: "social-places/restaurants-cafe" },
    ],
  },
  { label: "Store", value: "store" },
  { label: "Supermarket", value: "supermarket" },

  // T – W
  { label: "Technology", value: "technology" },
  { label: "Telecommunication", value: "telecommunication" },
  { label: "Tourism", value: "tourism" },
  { label: "Transportation & Logistic", value: "transportation-logistic" },
  { label: "Travel Agencies", value: "travel-agencies" },
  { label: "Waste Management", value: "waste-management" },
  { label: "Other", value: "other" },
];
