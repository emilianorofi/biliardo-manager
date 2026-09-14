import { getNationalityDisplay } from "@/lib/nationalities";

type NamePool = {
  firstNames: readonly string[];
  lastNames: readonly string[];
};

function pool(firstNames: string, lastNames: string): NamePool {
  return {
    firstNames: firstNames.split("|"),
    lastNames: lastNames.split("|"),
  };
}

const PLAYER_NAME_POOLS: Record<string, NamePool> = {
  ITA: pool(
    "Alessandro|Andrea|Antonio|Carlo|Claudio|Daniele|Davide|Enrico|Fabio|Federico|Francesco|Gabriele|Giacomo|Giovanni|Giulio|Lorenzo|Luca|Marco|Matteo|Michele|Nicola|Paolo|Riccardo|Roberto|Simone|Stefano|Tommaso|Vincenzo|Alberto|Massimo|Emanuele|Filippo|Leonardo|Salvatore|Pietro|Giorgio|Cristian|Raffaele|Dario|Samuele",
    "Rossi|Russo|Ferrari|Esposito|Bianchi|Romano|Colombo|Ricci|Marino|Greco|Bruno|Gallo|Conti|De Luca|Costa|Giordano|Mancini|Rizzo|Lombardi|Moretti|Barbieri|Fontana|Santoro|Mariani|Rinaldi|Caruso|Ferrara|Galli|Martini|Leone|Longo|Gentile|Martinelli|Vitale|Serra|Coppola|De Santis|D'Angelo|Marchetti|Parisi|Villa|Conte|Ferraro|Fabbri|Bianco|Marini|Grasso|Valentini|Messina|Sala|De Angelis|Gatti|Pellegrini|Palumbo|Sanna|Farina|Rizzi|Monti|Cattaneo|Morelli|Amato|Silvestri|Mazza|Bernardi|Testa|Grassi|Fiore|Pellegrino|Bellini|Piras|Orlando|Donati|Valli|Basile|Rossetti|De Rosa|Basso|Caputo|Negri|Spinelli|Barbato|Catalano|Neri|Pozzi|Palmieri|Martino|Pace|Belli|D'Amico|Giannini|Franchi|Sorrentino|Landi|Guerra|Benedetti|Pagani|Guidi|Ferretti|Riva|Montanari|Fiori|Puglisi|Antonelli|De Simone|Costantini|Bellucci|Pini|Sartori|Mazzanti|Cavalli|Carboni|Damiani|Bellotti|Castelli|Ruggieri|Poli|Milani|Alfieri|Barone|Scarpa|Nardi|Bertolini|Lorenzi|Mori|Gori|Meucci|Mannucci|Ceccarelli|Baldini|Martelli|Borghini|Paoletti|Nannini|Lotti|Bini|Pieroni|Bartoli|Bacci|Baldi|Sarti|Innocenti|Lenzi|Bagnoli|Ferri|Gentili|Santini|Leoni"
  ),
  ARG: pool(
    "Alejandro|Carlos|Diego|Emiliano|Federico|Gonzalo|Guillermo|Javier|Juan|Lautaro|Lucas|Marcelo|Martin|Matias|Nicolas|Pablo|Ramiro|Rodrigo|Santiago|Sebastian|Tomas|Agustin|Franco|Facundo|Leandro|Ignacio|Mauro|Nahuel|Ezequiel|German",
    "Gonzalez|Rodriguez|Gomez|Fernandez|Lopez|Diaz|Martinez|Perez|Romero|Sosa|Alvarez|Torres|Ruiz|Ramirez|Flores|Acosta|Benitez|Medina|Herrera|Suarez|Aguirre|Gimenez|Gutierrez|Pereyra|Rojas|Molina|Castro|Ortiz|Silva|Nunez|Luna|Cabrera|Vega|Arias|Farias|Navarro|Correa|Dominguez|Velez|Ibarra|Cardozo|Villalba|Quiroga|Godoy|Ferreyra|Mansilla|Peralta|Lucero|Ojeda|Bustos|Ledesma|Ponce|Juarez|Mendez|Paz|Valdez|Miranda|Caceres|Barrios|Almada|Escobar|Arce|Vera|Toledo|Cordoba|Gaitan|Salas|Oliva|Montiel|Andrada"
  ),
  GER: pool(
    "Alexander|Andreas|Benjamin|Christian|Daniel|David|Felix|Florian|Jan|Johannes|Jonas|Julian|Lars|Leon|Lukas|Manuel|Marcel|Martin|Matthias|Max|Michael|Nico|Sebastian|Stefan|Tobias|Thomas|Tim|Philipp|Moritz|Kai",
    "Muller|Schmidt|Schneider|Fischer|Weber|Meyer|Wagner|Becker|Hoffmann|Schulz|Koch|Bauer|Richter|Klein|Wolf|Schroder|Neumann|Schwarz|Zimmermann|Braun|Kruger|Hofmann|Hartmann|Lange|Schmitt|Werner|Schmitz|Krause|Meier|Lehmann|Schmid|Schulze|Maier|Kohler|Herrmann|Konig|Walter|Mayer|Huber|Kaiser|Fuchs|Peters|Lang|Scholz|Moller|Weiss|Jung|Hahn|Keller|Vogel|Friedrich|Gunther|Frank|Berger|Winkler|Roth|Beck|Lorenz|Baumann|Franke"
  ),
  URU: pool(
    "Alejandro|Andres|Bruno|Carlos|Diego|Emiliano|Facundo|Federico|Gaston|Gonzalo|Ignacio|Joaquin|Juan|Leandro|Lucas|Martin|Matias|Nicolas|Rodrigo|Santiago|Sebastian|Tomas|Agustin|Franco|Mauricio",
    "Rodriguez|Gonzalez|Martinez|Fernandez|Perez|Garcia|Silva|Lopez|Pereira|Sosa|Suarez|Diaz|Torres|Mendez|Acosta|Cabrera|Viera|Olivera|Cardozo|Castro|Ramos|Nunez|Medina|Moreira|Bentancur|Lemos|Correa|Gimenez|Techera|Barboza|Araújo|Fagundez|Larrosa|Berrutti|Capote|Abreu|Caceres|Godin|Muslera|Forlan|Recoba|Pereyra|Vecino|Coates|Arambarri"
  ),
  FRA: pool(
    "Alexandre|Alexis|Antoine|Baptiste|Benjamin|Clement|Damien|David|Florian|Francois|Guillaume|Hugo|Julien|Laurent|Lucas|Mathieu|Maxime|Michael|Nicolas|Olivier|Pierre|Quentin|Romain|Sebastien|Thomas|Valentin|Vincent|Theo|Adrien|Remi",
    "Martin|Bernard|Dubois|Thomas|Robert|Richard|Petit|Durand|Leroy|Moreau|Simon|Laurent|Lefebvre|Michel|Garcia|David|Bertrand|Roux|Vincent|Fournier|Morel|Girard|Andre|Lefevre|Mercier|Dupont|Lambert|Bonnet|Francois|Martinez|Legrand|Garnier|Faure|Rousseau|Blanc|Guerin|Muller|Henry|Roussel|Nicolas|Perrin|Morin|Mathieu|Clement|Gauthier|Dumont|Lopez|Fontaine|Chevalier|Robin|Masson|Sanchez|Gerard|Boyer|Denis|Lemaire|Duval|Joly|Gautier|Roger"
  ),
  DEN: pool(
    "Anders|Andreas|Christian|Emil|Frederik|Henrik|Jacob|Jens|Jonas|Kasper|Lars|Mads|Magnus|Martin|Mathias|Mikkel|Nicolai|Niels|Oliver|Peter|Rasmus|Simon|Soren|Thomas|Victor",
    "Jensen|Nielsen|Hansen|Pedersen|Andersen|Christensen|Larsen|Sorensen|Rasmussen|Jorgensen|Petersen|Madsen|Kristensen|Olsen|Thomsen|Christiansen|Poulsen|Johansen|Moller|Mortensen|Knudsen|Jakobsen|Jacobsen|Mikkelsen|Frederiksen|Lauridsen|Kjær|Holm|Schmidt|Lund|Jeppesen|Dahl|Berg|Bak|Winther|Friis|Krogh|Bruun|Vestergaard|Kirkegaard|Lindberg|Damgaard|Kristoffersen|Sondergaard|Bjerre"
  ),
  BEL: pool(
    "Arthur|Bram|Cedric|Dries|Elias|Emile|Gilles|Jasper|Jeroen|Jonas|Julien|Kevin|Laurent|Louis|Lucas|Mathias|Maxime|Nicolas|Olivier|Pieter|Quentin|Ruben|Simon|Thomas|Victor|Wout|Yannick|Thibault|Sven|Koen",
    "Peeters|Janssens|Maes|Willems|Claes|Goossens|Wouters|Jacobs|De Smet|Vermeulen|De Clercq|Dubois|Lambert|Aerts|Mertens|De Vos|Van Damme|Van de Velde|Vandenberghe|Van den Bossche|Van Dyck|Van Hecke|Van Loon|Van den Broeck|De Meyer|De Pauw|De Ridder|De Cock|De Winter|De Wilde|Verhoeven|Hermans|Thijs|Simon|Michel|Laurent|Leclercq|Renard|Gerard|Denis|Mathys|Dumont|Collard|Lacroix|Henry|Lejeune|Verbeeck|Devos|Vercauteren|Desmet"
  ),
  BRA: pool(
    "Adriano|Anderson|Bruno|Caio|Carlos|Danilo|Diego|Eduardo|Fabio|Felipe|Gabriel|Gustavo|Henrique|Joao|Leonardo|Lucas|Marcelo|Marcos|Mateus|Matheus|Murilo|Paulo|Rafael|Renato|Ricardo|Rodrigo|Thiago|Vinicius|Wagner|William",
    "Silva|Santos|Oliveira|Souza|Rodrigues|Ferreira|Alves|Pereira|Lima|Gomes|Costa|Ribeiro|Martins|Carvalho|Almeida|Lopes|Soares|Fernandes|Vieira|Barbosa|Rocha|Dias|Nascimento|Andrade|Moreira|Nunes|Marques|Machado|Mendes|Freitas|Cardoso|Ramos|Goncalves|Santana|Teixeira|Araujo|Pinto|Moura|Correia|Cavalcanti|Monteiro|Melo|Castro|Campos|Moraes|Borges|Tavares|Farias|Coelho|Rezende|Duarte|Viana|Amorim|Batista|Medeiros|Neves|Queiroz|Xavier|Assis|Barros"
  ),
  ESP: pool(
    "Adrian|Alejandro|Alvaro|Andres|Antonio|Carlos|Daniel|David|Diego|Eduardo|Fernando|Francisco|Gabriel|Hector|Ivan|Javier|Jorge|Jose|Juan|Luis|Manuel|Marcos|Miguel|Pablo|Raul|Ruben|Sergio|Victor|Alberto|Oscar",
    "Garcia|Fernandez|Gonzalez|Rodriguez|Lopez|Martinez|Sanchez|Perez|Gomez|Martin|Jimenez|Ruiz|Hernandez|Diaz|Moreno|Munoz|Alvarez|Romero|Alonso|Gutierrez|Navarro|Torres|Dominguez|Vazquez|Ramos|Gil|Ramirez|Serrano|Blanco|Molina|Morales|Suarez|Ortega|Delgado|Castro|Ortiz|Rubio|Marin|Sanz|Nunez|Iglesias|Medina|Garrido|Cortes|Castillo|Santos|Lozano|Guerrero|Cano|Prieto|Mendez|Calvo|Vidal|Campos|Nieto|Reyes|Pascual|Duran|Carmona|Moya"
  ),
  NED: pool(
    "Bram|Daan|Dirk|Erik|Frank|Jasper|Jeroen|Joost|Koen|Lars|Luuk|Maarten|Mark|Martijn|Niels|Pieter|Rick|Ruben|Sander|Sem|Sven|Thomas|Tim|Wout|Willem",
    "De Jong|Jansen|De Vries|Van Dijk|Bakker|Visser|Smit|Meijer|De Boer|Mulder|De Groot|Bos|Vos|Peters|Hendriks|Dekker|Brouwer|De Wit|Dijkstra|Smits|De Graaf|Van Leeuwen|Kok|Jacobs|Koster|Verhoeven|Van den Berg|Van der Meer|Van der Linden|Van de Ven|Van Dam|Kuiper|Hoekstra|Schouten|Kramer|Prins|Post|Scholten|Timmer|Huisman|Willems|Blom|Jonker|Wessels|Kooij|Veenstra|Van Loon|Van Beek|Van der Heijden|Van Vliet"
  ),
  SUI: pool(
    "Adrian|Andreas|Beat|Benjamin|Christian|Daniel|David|Fabian|Florian|Jan|Jonas|Lars|Luca|Manuel|Marco|Martin|Michael|Nico|Patrick|Philipp|Remo|Simon|Stefan|Thomas|Yannick",
    "Muller|Meier|Schmid|Keller|Weber|Frei|Brunner|Marti|Gerber|Baumann|Moser|Huber|Schneider|Steiner|Widmer|Roth|Schaller|Ammann|Christen|Zimmermann|Wenger|Sutter|Furrer|Aebischer|Egger|Graf|Hofer|Kunz|Bachmann|Berger|Buhler|Fischer|Kaufmann|Maurer|Pfister|Ruegg|Stalder|Studer|Zbinden|Arnold|Bieri|Burri|Gasser|Gisler|Imhof|Kessler|Luthi|Odermatt|Wuthrich|Ziegler"
  ),
  CZE: pool(
    "Adam|David|Filip|Jakub|Jan|Jiri|Josef|Karel|Lukas|Marek|Martin|Matej|Michal|Milan|Ondrej|Pavel|Petr|Radek|Roman|Tomas|Vaclav|Vojtech|Daniel|Dominik|Patrik",
    "Novak|Svoboda|Novotny|Dvorak|Cerny|Prochazka|Kucera|Vesely|Horak|Nemec|Marek|Pokorny|Jira|Ruzicka|Benes|Fiala|Sedlacek|Hajek|Kral|Dolezal|Navratil|Cermak|Stanek|Valenta|Soukup|Jelinek|Urban|Sykora|Pavlik|Blaha|Konecny|Musil|Tichy|Sima|Vacek|Holub|Janda|Polak|Kolar|Kubik|Havel|Vitek|Vlcek|Barton|Kovar"
  ),
  AUT: pool(
    "Andreas|Benjamin|Christian|Daniel|David|Florian|Georg|Johannes|Julian|Lukas|Manuel|Martin|Matthias|Maximilian|Michael|Patrick|Philipp|Sebastian|Stefan|Thomas|Tobias|Alexander|Christoph|Dominik|Felix",
    "Gruber|Huber|Bauer|Wagner|Muller|Pichler|Steiner|Moser|Berger|Hofer|Eder|Mayer|Winkler|Leitner|Fuchs|Schmid|Wimmer|Reiter|Auer|Koller|Schuster|Ebner|Mayr|Stadler|Haider|Haas|Egger|Bruckner|Baumgartner|Zauner|Thaler|Kirchner|Riegler|Ortner|Seidl|Winter|Krenn|Gasser|Lechner|Rainer|Holzer|Mair|Lindner|Weiss|Kofler"
  ),
  TUR: pool(
    "Ahmet|Ali|Arda|Berk|Burak|Can|Cem|Emre|Enes|Eren|Furkan|Hakan|Hasan|Ibrahim|Kerem|Mehmet|Mert|Murat|Mustafa|Okan|Onur|Serkan|Tolga|Umut|Yusuf",
    "Yilmaz|Kaya|Demir|Sahin|Celik|Yildiz|Yildirim|Ozturk|Aydin|Ozdemir|Arslan|Dogan|Kilic|Aslan|Cetin|Kara|Koc|Kurt|Ozkan|Simsek|Polat|Korkmaz|Gunes|Acar|Tekin|Bulut|Erdem|Kaplan|Keskin|Tas|Avci|Turan|Aksoy|Ekinci|Bozkurt|Karaca|Guler|Aydemir|Duman|Ucar|Coskun|Yavuz|Kose|Eren|Sezer"
  ),
  COL: pool(
    "Alejandro|Andres|Camilo|Carlos|Cristian|Daniel|David|Diego|Felipe|Fernando|Javier|Jhon|Jorge|Jose|Juan|Julian|Kevin|Luis|Mateo|Miguel|Nicolas|Oscar|Santiago|Sebastian|Victor",
    "Rodriguez|Martinez|Garcia|Gomez|Lopez|Gonzalez|Hernandez|Sanchez|Ramirez|Perez|Diaz|Torres|Rojas|Moreno|Munoz|Alvarez|Romero|Gutierrez|Castro|Vargas|Suarez|Ruiz|Herrera|Jimenez|Morales|Ortiz|Medina|Silva|Cardenas|Restrepo|Quintero|Ospina|Valencia|Agudelo|Bermudez|Cifuentes|Cortes|Escobar|Giraldo|Jaramillo|Londono|Marin|Montoya|Pineda|Salazar|Zapata|Arango|Bedoya|Mosquera|Murillo"
  ),
  JPN: pool(
    "Akira|Daichi|Daisuke|Haruto|Hayato|Hiroki|Hiroshi|Itsuki|Kaito|Kazuki|Kenji|Kenta|Kohei|Naoki|Ren|Riku|Ryota|Satoshi|Shota|Sota|Takumi|Taro|Yamato|Yuki|Yuta",
    "Sato|Suzuki|Takahashi|Tanaka|Watanabe|Ito|Yamamoto|Nakamura|Kobayashi|Kato|Yoshida|Yamada|Sasaki|Yamaguchi|Matsumoto|Inoue|Kimura|Hayashi|Shimizu|Yamazaki|Mori|Abe|Ikeda|Hashimoto|Ishikawa|Nakajima|Maeda|Fujita|Ogawa|Goto|Okada|Hasegawa|Murakami|Kondo|Ishii|Saito|Sakamoto|Endo|Aoki|Fujii|Nishimura|Fukuda|Ota|Miura|Fujiwara|Okamoto|Matsuda|Nakagawa|Nakano|Harada"
  ),
  LUX: pool(
    "Alex|Ben|Chris|David|Eric|Felix|Georges|Jean|Jonathan|Kevin|Laurent|Marc|Mathieu|Max|Nicolas|Patrick|Paul|Philippe|Tom|Yann",
    "Schmit|Muller|Weber|Hoffmann|Wagner|Thill|Klein|Schmitz|Kremer|Reuter|Meyer|Wolff|Faber|Peters|Simon|Kayser|Welter|Schroeder|Majerus|Steffen|Bintz|Theis|Gillen|Kieffer|Lorang|Reding|Goedert|Weis|Pereira|Da Silva|Ferreira|Martins|Rodrigues|Correia|Oliveira"
  ),
  SMR: pool(
    "Alessandro|Andrea|Davide|Enrico|Fabio|Federico|Francesco|Giacomo|Luca|Marco|Matteo|Michele|Nicola|Paolo|Riccardo",
    "Casadei|Cecchetti|Ciavatta|Della Balda|Fabbri|Fanti|Gasparoni|Giardi|Gosti|Guidi|Macina|Marani|Mularoni|Muratoni|Pedini|Pelliccioni|Podeschi|Righi|Selva|Simoncini|Stolfi|Terenzi|Ugollini|Valentini|Zafferani|Bacciocchi|Belluzzi|Berti|Bollini|Bronzetti"
  ),
  NOR: pool(
    "Anders|Andreas|Bjarne|Christian|Eirik|Emil|Erik|Fredrik|Henrik|Jan|Jonas|Kristian|Lars|Magnus|Marius|Martin|Mats|Ole|Sander|Simen|Stian|Thomas|Tobias|Vegard|Vidar",
    "Hansen|Johansen|Olsen|Larsen|Andersen|Pedersen|Nilsen|Kristiansen|Jensen|Karlsen|Johnsen|Pettersen|Eriksen|Berg|Haugen|Hagen|Johannessen|Andreassen|Jacobsen|Dahl|Jorgensen|Henriksen|Lund|Halvorsen|Sorensen|Jakobsen|Moen|Gundersen|Iversen|Strand|Solberg|Knutsen|Eide|Bakken|Lie|Aas|Myhre|Tangen|Lindberg|Nordli|Brekke|Hovland|Sveen|Vik|Lien"
  ),
  POR: pool(
    "Andre|Antonio|Bruno|Carlos|Diogo|Duarte|Eduardo|Fabio|Filipe|Francisco|Goncalo|Hugo|Joao|Jorge|Jose|Luis|Manuel|Marco|Miguel|Nuno|Paulo|Pedro|Ricardo|Rui|Tiago",
    "Silva|Santos|Ferreira|Pereira|Oliveira|Costa|Rodrigues|Martins|Jesus|Sousa|Fernandes|Goncalves|Gomes|Lopes|Marques|Alves|Almeida|Ribeiro|Pinto|Carvalho|Teixeira|Moreira|Correia|Mendes|Nunes|Soares|Vieira|Monteiro|Cardoso|Rocha|Coelho|Cruz|Cunha|Pires|Ramos|Reis|Simões|Tavares|Mota|Fonseca|Baptista|Neves|Faria|Azevedo|Melo|Barbosa|Machado|Castro|Freitas|Leal"
  ),
  SWE: pool(
    "Anders|Andreas|Daniel|Emil|Erik|Fredrik|Gustav|Henrik|Johan|Jonas|Karl|Kristoffer|Lars|Linus|Magnus|Marcus|Martin|Mattias|Mikael|Niklas|Oskar|Per|Simon|Thomas|Viktor",
    "Andersson|Johansson|Karlsson|Nilsson|Eriksson|Larsson|Olsson|Persson|Svensson|Gustafsson|Pettersson|Jonsson|Jansson|Hansson|Bengtsson|Jönsson|Lindberg|Jakobsson|Magnusson|Olofsson|Lindström|Lindqvist|Lindgren|Axelsson|Berg|Bergström|Lundberg|Lundqvist|Mattsson|Fredriksson|Sandberg|Henriksson|Sjöberg|Forsberg|Wallin|Engström|Eklund|Danielsson|Håkansson|Björk|Nyström|Holm|Ekström|Sundberg|Nordström"
  ),
  ALB: pool(
    "Adrian|Alban|Altin|Andi|Arben|Ardit|Arjan|Armando|Besart|Bledar|Dritan|Edmond|Elton|Erion|Ermal|Florian|Gentian|Ilir|Klodian|Lorik|Mentor|Orges|Redi|Sokol|Valon",
    "Hoxha|Shehu|Dervishi|Kola|Leka|Gjoni|Marku|Prifti|Gjoka|Basha|Mema|Meta|Deda|Rama|Çela|Bardhi|Lleshi|Berisha|Krasniqi|Hasani|Shala|Kelmendi|Duka|Muca|Nika|Pasha|Toska|Kurti|Maliqi|Zeka|Bajrami|Laci|Aliaj|Balla|Bushati|Cani|Koci|Lika|Mehmeti|Muka|Pepa|Ruci|Spahiu|Vata|Xhafa"
  ),
  LIE: pool(
    "Adrian|Alexander|Andreas|Benjamin|Christian|Daniel|David|Florian|Georg|Johannes|Lukas|Manuel|Marco|Martin|Michael|Nico|Patrick|Philipp|Simon|Thomas",
    "Büchel|Beck|Frick|Hasler|Hilti|Marxer|Ospelt|Ritter|Schädler|Vogt|Walser|Wanger|Wohlwend|Batliner|Frommelt|Gassner|Kindle|Kranz|Lampert|Matt|Näscher|Sele|Sprenger|Wolfinger|Amann|Biedermann|Eberle|Goop|Kaiser|Meier|Mündle|Risch|Schurte|Wachter|Wille"
  ),
  KOR: pool(
    "Dong-hyun|Hyun-woo|Ji-hoon|Jin-woo|Jun-ho|Jun-seo|Jung-ho|Min-jun|Min-seok|Sang-ho|Seong-ho|Seung-hyun|Tae-hyun|Woo-jin|Young-ho|Young-min|Byung-ho|Dae-hyun|Jae-hyun|Jae-min|Joon-young|Sung-min|Tae-min|Won-jun|Hyun-seok",
    "Kim|Lee|Park|Choi|Jung|Kang|Cho|Yoon|Jang|Lim|Han|Oh|Seo|Shin|Kwon|Hwang|Ahn|Song|Hong|Yoo|Ko|Moon|Yang|Son|Bae|Baek|Heo|Nam|Shim|Noh|Ha|Kwak|Sung|Cha|Joo|Woo|Ryu|Jeon|Min|Jin|Ji|Byun|Eun|Ma|Do"
  ),
  EGY: pool(
    "Ahmed|Ali|Amr|Ayman|Essam|Hassan|Hesham|Ibrahim|Karim|Khaled|Mahmoud|Mohamed|Mostafa|Omar|Osama|Ramadan|Sameh|Sherif|Tamer|Wael|Yasser|Youssef|Adel|Emad|Mina",
    "Mohamed|Ahmed|Ali|Hassan|Mahmoud|Ibrahim|Mostafa|Khalil|Hussein|Sayed|Abdelrahman|Saleh|Fathy|Gamal|Mansour|Nassar|Farouk|Salem|Kamel|Hamdy|Amin|Ashour|Bakr|El-Sayed|Gaber|Hegazy|Ismail|Lotfy|Magdy|Morsy|Nasr|Ragab|Saad|Tawfik|Zaki|Abdallah|El-Masry|Shawky|Soliman|Younis|Kandil|Refaat|Samir|Aziz|Eid"
  ),
};

function getPool(nationality: string) {
  const code = getNationalityDisplay(nationality).code;
  return PLAYER_NAME_POOLS[code] ?? PLAYER_NAME_POOLS.ITA;
}

export function getGeneratedPlayerName(
  nationality: string,
  sequence: number
) {
  const pool = getPool(nationality);
  const safeSequence = Math.max(0, Math.trunc(sequence));
  const lastNameIndex = safeSequence % pool.lastNames.length;
  const firstNameIndex =
    (safeSequence * 7 + Math.floor(safeSequence / pool.lastNames.length)) %
    pool.firstNames.length;

  return {
    firstName: pool.firstNames[firstNameIndex],
    lastName: pool.lastNames[lastNameIndex],
  };
}

export function getStablePlayerSurname(
  nationality: string,
  stableId: number,
  offset = 0
) {
  const pool = getPool(nationality);
  const safeId = Math.abs(Math.trunc(stableId));
  const safeOffset = Math.max(0, Math.trunc(offset));
  return pool.lastNames[(safeId + safeOffset) % pool.lastNames.length];
}

export function getPlayerSurnamePoolSize(nationality: string) {
  return getPool(nationality).lastNames.length;
}
