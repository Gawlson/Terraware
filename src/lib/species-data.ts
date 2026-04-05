// lib/species-data.ts

export interface Species {
  commonName: string;
  scientificName: string;
  speciesKey: number;
  iucn: "CR" | "EN" | "VU";
}

export const IUCN_LABELS: Record<string, string> = {
  CR: "Critically Endangered",
  EN: "Endangered",
  VU: "Vulnerable",
}

export const IUCN_COLORS: Record<string, string> = {
  CR: "#BC4749",  // red
  EN: "#f59e0b",  // amber
  VU: "#6A994E",  // green
}
export const SPECIES_LIST: Species[] = [
  { commonName: "California Condor", scientificName: "Gymnogyps californianus", speciesKey: 2481920, iucn: "CR" },
  { commonName: "Whooping Crane", scientificName: "Grus americana", speciesKey: 2474941, iucn: "EN" },
  { commonName: "Black-footed Ferret", scientificName: "Mustela nigripes", speciesKey: 5218985, iucn: "EN" },
  { commonName: "Florida Panther", scientificName: "Puma concolor coryi", speciesKey: 6164600, iucn: "EN" },
  { commonName: "Hawaiian Monk Seal", scientificName: "Neomonachus schauinslandi", speciesKey: 8646426, iucn: "EN" },
  { commonName: "Red Wolf", scientificName: "Canis rufus", speciesKey: 5219186, iucn: "CR" },
  { commonName: "Ocelot", scientificName: "Leopardus pardalis", speciesKey: 2434982, iucn: "EN" },
  { commonName: "Grizzly Bear", scientificName: "Ursus arctos", speciesKey: 2433433, iucn: "VU" },
  { commonName: "Wolverine", scientificName: "Gulo gulo", speciesKey: 5219073, iucn: "VU" },
  { commonName: "Jaguar", scientificName: "Panthera onca", speciesKey: 5219426, iucn: "VU" },
  { commonName: "West Indian Manatee", scientificName: "Trichechus manatus", speciesKey: 2435296, iucn: "VU" },
  { commonName: "Leatherback Sea Turtle", scientificName: "Dermochelys coriacea", speciesKey: 9789983, iucn: "VU" },
  { commonName: "Loggerhead Sea Turtle", scientificName: "Caretta caretta", speciesKey: 8894817, iucn: "VU" },
  { commonName: "Green Sea Turtle", scientificName: "Chelonia mydas", speciesKey: 2442225, iucn: "EN" },
  { commonName: "Hawksbill Sea Turtle", scientificName: "Eretmochelys imbricata", speciesKey: 8841716, iucn: "CR" },
  { commonName: "Atlantic Sturgeon", scientificName: "Acipenser oxyrinchus", speciesKey: 4287132, iucn: "VU" },
  { commonName: "Bald Eagle", scientificName: "Haliaeetus leucocephalus", speciesKey: 2480446, iucn: "VU" },
  { commonName: "Red-cockaded Woodpecker", scientificName: "Picoides borealis", speciesKey: 2477828, iucn: "VU" },
  { commonName: "Eastern Bluebird", scientificName: "Sialia sialis", speciesKey: 2490941, iucn: "VU" },
  { commonName: "Piping Plover", scientificName: "Charadrius melodus", speciesKey: 2480283, iucn: "EN" },
  { commonName: "Least Tern", scientificName: "Sternula antillarum", speciesKey: 5789285, iucn: "VU" },
  { commonName: "Loggerhead Shrike", scientificName: "Lanius ludovicianus", speciesKey: 2492870, iucn: "VU" },
  { commonName: "Southwestern Willow Flycatcher", scientificName: "Empidonax traillii extimus", speciesKey: 6174856, iucn: "EN" },
  { commonName: "Black-capped Vireo", scientificName: "Vireo atricapilla", speciesKey: 2487438, iucn: "VU" },
  { commonName: "Ivory-billed Woodpecker", scientificName: "Campephilus principalis", speciesKey: 2478561, iucn: "CR" },
  { commonName: "Field Sparrow", scientificName: "Spizella pusilla", speciesKey: 2492096, iucn: "VU" },
  { commonName: "California Red-legged Frog", scientificName: "Rana draytonii", speciesKey: 2426756, iucn: "VU" },
  { commonName: "California Tiger Salamander", scientificName: "Ambystoma californiense", speciesKey: 2431960, iucn: "VU" },
  { commonName: "Desert Slender Salamander", scientificName: "Batrachoseps aridus", speciesKey: 2431765, iucn: "EN" },
  { commonName: "Wyoming Toad", scientificName: "Anaxyrus baxteri", speciesKey: 2422894, iucn: "CR" },
  { commonName: "Lake Sturgeon", scientificName: "Acipenser fulvescens", speciesKey: 2402120, iucn: "VU" },
  { commonName: "Pallid Sturgeon", scientificName: "Scaphirhynchus albus", speciesKey: 2402088, iucn: "CR" },
  { commonName: "Devils Hole Pupfish", scientificName: "Cyprinodon diabolis", speciesKey: 2347934, iucn: "CR" },
  { commonName: "Chinook Salmon", scientificName: "Oncorhynchus tshawytscha", speciesKey: 5204024, iucn: "VU" },
  { commonName: "Steelhead Trout", scientificName: "Oncorhynchus mykiss", speciesKey: 5204019, iucn: "VU" },
  { commonName: "Bull Trout", scientificName: "Salvelinus confluentus", speciesKey: 2351244, iucn: "VU" },
  { commonName: "Smoky Madtom", scientificName: "Noturus baileyi", speciesKey: 2341038, iucn: "CR" },
  { commonName: "Tubercled Blossom Mussel", scientificName: "Epioblasma torulosa", speciesKey: 2288208, iucn: "CR" },
  { commonName: "Louisiana Pearlshell", scientificName: "Margaritifera hembeli", speciesKey: 2287871, iucn: "CR" },
  { commonName: "Robbins' Milkvetch", scientificName: "Astragalus robbinsii", speciesKey: 5345273, iucn: "EN" },
  { commonName: "Prickly Apple Cactus", scientificName: "Cereus eriophorus", speciesKey: 5383996, iucn: "EN" },
  { commonName: "Santa Barbara Island Dudleya", scientificName: "Dudleya traskiae", speciesKey: 2985874, iucn: "EN" },
  { commonName: "Franklinia", scientificName: "Franklinia alatamaha", speciesKey: 5421082, iucn: "CR" },
  { commonName: "Knowlton Cactus", scientificName: "Pediocactus knowltonii", speciesKey: 3084077, iucn: "EN" },
  { commonName: "Small Whorled Pogonia", scientificName: "Isotria medeoloides", speciesKey: 2808818, iucn: "EN" },
  { commonName: "Eastern Prairie Fringed Orchid", scientificName: "Platanthera leucophaea", speciesKey: 2798308, iucn: "EN" },
  { commonName: "Navasota Ladies'-tresses", scientificName: "Spiranthes parksii", speciesKey: 2805362, iucn: "EN" },
  { commonName: "Geocarpon", scientificName: "Geocarpon minimum", speciesKey: 3085364, iucn: "EN" },
  { commonName: "Little-leaf Heartleaf", scientificName: "Hexastylis naniflora", speciesKey: 5331108, iucn: "EN" },
  { commonName: "American Chaffseed", scientificName: "Schwalbea americana", speciesKey: 3172121, iucn: "EN" },
];