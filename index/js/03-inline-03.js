// â”€â”€ APUSH TIMELINE (vanilla JS, no dependencies) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildTimeline(){
  var root=document.getElementById('timeline-root');
  if(!root)return;

  var CATS=[
    {id:'politics',label:'Government & Politics',color:'#60A5FA',bg:'rgba(96,165,250,0.055)'},{id:'economy', label:'Economy & Labor',       color:'#FBBF24',bg:'rgba(251,191,36,0.055)'},{id:'religion',label:'Religion & Culture',    color:'#C084FC',bg:'rgba(192,132,252,0.055)'},{id:'society', label:'Society & Civil Rights',color:'#4ADE80',bg:'rgba(74,222,128,0.055)'},{id:'military',label:'Military & Foreign Policy',color:'#F87171',bg:'rgba(248,113,113,0.055)'}
  ];
  var PERIODS=[
    {id:'all',label:'All Periods',start:1590,end:2025},{id:'B',label:'Colonial',start:1607,end:1754},{id:'C',label:'Revolution',start:1754,end:1800},{id:'D',label:'Early Republic',start:1800,end:1848},{id:'E',label:'Civil War Era',start:1844,end:1877},{id:'F',label:'Gilded Age',start:1865,end:1898},{id:'G',label:'Progressive/WWII',start:1890,end:1945},{id:'H',label:'Cold War',start:1945,end:1980},{id:'I',label:'Modern Era',start:1980,end:2015}
  ];
  var THEMES=[
    {id:'nat',label:'American Identity',color:'#93C5FD',arc:'Colonists moved from local, imperial, and regional identities toward a contested national identity shaped by citizenship, race, immigration, and civil rights.',periods:{B:'Identity was mostly local, colonial, religious, and British, with sharp divisions among Europeans, Africans, and Native peoples.',C:'Revolutionary ideas created a new republican identity, but citizenship remained limited by race, gender, property, and region.',D:'National identity expanded through market growth and westward settlement while sectional identities hardened over slavery.',E:'The Civil War tested whether the United States was one nation; Reconstruction briefly redefined citizenship through the 13th, 14th, and 15th Amendments.',F:'Industrial growth, immigration, segregation, and Native dispossession made national identity more contested and unequal.',G:'Progressive reform, world wars, migration, and mass culture expanded national identity while exposing racial and gender limits.',H:'Cold War patriotism, civil rights activism, feminism, and youth protest fought over who counted as fully American.',I:'Modern identity became more diverse and polarized through immigration, multiculturalism, rights movements, and partisan conflict.'}},
    {id:'wxt',label:'Work, Exchange, Tech',color:'#FBBF24',arc:'The economy shifted from mercantilist plantations and farms to industrial capitalism, mass consumption, federal regulation, and a service/tech economy.',periods:{B:'Colonial economies centered on Atlantic trade, staple crops, mercantilism, indentured labor, and slavery.',C:'Independence disrupted British trade and raised arguments over tariffs, debt, banks, and federal economic power.',D:'The market revolution expanded factories, canals, cotton, banks, wage labor, and regional economic specialization.',E:'War and western settlement accelerated railroads, federal land policy, free labor ideology, and conflict over slave labor.',F:'Corporations, railroads, trusts, factories, labor unions, and urban work transformed capitalism.',G:'Progressives and the New Deal increased federal regulation, labor protections, banking reform, and wartime production.',H:'Suburbs, defense spending, consumer culture, automation, and deindustrialization reshaped work and class life.',I:'Globalization, finance, service work, digital technology, inequality, and health-care costs became central economic issues.'}},
    {id:'geo',label:'Geography & Environment',color:'#34D399',arc:'Land changed from a source of colonization and extraction into a national resource contested through expansion, conservation, suburbanization, and environmental politics.',periods:{B:'European settlement transformed Native lands through disease, agriculture, trade, and competing imperial claims.',C:'Independence opened debates over western land, Native sovereignty, and who controlled the interior.',D:'Expansion, cotton, canals, and removal policies pushed settlement west and intensified environmental change.',E:'War, homesteading, mining, and railroads sped western settlement and Native displacement.',F:'Industrial cities, mining, railroads, reservations, and conservation debates changed the landscape.',G:'Progressive conservation, Dust Bowl collapse, TVA projects, and wartime industry tied environment to federal power.',H:'Suburbs, highways, nuclear sites, Sun Belt growth, and the environmental movement changed regional life.',I:'Climate, energy, immigration geography, suburban sprawl, and coastal/global connections shaped politics.'}},
    {id:'mig',label:'Migration & Settlement',color:'#60A5FA',arc:'Migration moved from coerced Atlantic labor and European settlement to westward expansion, urban immigration, internal migration, suburbanization, and global migration.',periods:{B:'Settlement involved European migration, forced African migration, and Native displacement across contested colonies.',C:'Revolution and republican expansion encouraged western settlement while slavery and Native conflict remained unresolved.',D:'Cotton expansion, Indian removal, immigration, and frontier settlement transformed the country.',E:'Westward settlement and wartime mobility increased as slavery expansion drove national crisis.',F:'New immigration, urbanization, reservation policy, and western settlement reshaped demographics.',G:'The Great Migration, immigration restriction, Dust Bowl movement, and wartime relocation changed population patterns.',H:'Suburbs, the Sun Belt, Latino and Asian immigration, and Great Migration continuities reshaped politics and culture.',I:'Post-1965 immigration, globalization, border politics, and metropolitan growth made migration a central issue.'}},
    {id:'pce',label:'Politics & Power',color:'#C084FC',arc:'Power shifted from imperial rule to republican government, party conflict, federal expansion, reform politics, civil rights law, and modern polarization.',periods:{B:'Colonial assemblies, imperial authority, self-rule, and royal control competed for power.',C:'Revolutionary resistance produced independence, the Constitution, federalism, and the first party system.',D:'Democratization expanded white male voting while courts, parties, and presidents fought over federal power.',E:'Sectional politics collapsed into civil war; Reconstruction expanded and then retreated from federal protection of rights.',F:'Party machines, courts, limited government, and business power dominated national politics.',G:'Progressivism, New Deal liberalism, and wartime government greatly expanded federal authority.',H:'Cold War policy, civil rights legislation, Great Society programs, and conservative backlash reshaped power.',I:'Polarization, deregulation, executive power, courts, media, and rights debates defined politics.'}},
    {id:'wor',label:'America in the World',color:'#F87171',arc:'The United States moved from a colonial outpost to an independent republic, continental power, empire, global superpower, and contested world leader.',periods:{B:'Colonies were part of European imperial rivalries and Atlantic trade networks.',C:'The Revolution turned imperial conflict into independence and forced the new nation to manage diplomacy.',D:'The Monroe Doctrine, trade, and territorial expansion asserted U.S. influence in the hemisphere.',E:'The Mexican-American War and Civil War tied expansion, slavery, and foreign recognition to national survival.',F:'Industrial power and the Spanish-American War pushed the United States into overseas empire.',G:'World War I, isolationism, World War II, and the atomic bomb made the United States a global power.',H:'Containment, alliances, wars in Asia, nuclear rivalry, and diplomacy defined Cold War leadership.',I:'After the Cold War, terrorism, globalization, trade, and military intervention shaped U.S. world power.'}},
    {id:'arc',label:'Regional Culture',color:'#F472B6',arc:'Regional cultures moved from colonial diversity to sectional conflict, urban and rural divides, mass culture, Sun Belt growth, and partisan geography.',periods:{B:'New England, Chesapeake, Middle, Southern, Spanish, French, African, and Native societies developed distinct cultures.',C:'Regional revolutionary experiences differed, but republican culture created shared political language.',D:'North, South, and West grew more distinct through slavery, markets, religion, and reform.',E:'Sectional cultures split over slavery and Union, then Reconstruction exposed regional conflict over freedom.',F:'Urban industrial culture, rural populism, western settlement, and Jim Crow South diverged sharply.',G:'Mass media, migration, Harlem Renaissance, and wartime mobilization connected regions while preserving divides.',H:'Suburban culture, Sun Belt growth, civil rights, and counterculture reshaped regional identities.',I:'Red-blue geography, metropolitan growth, immigration, and media ecosystems deepened regional divides.'}},
    {id:'soc',label:'Social Structures',color:'#A7F3D0',arc:'Social hierarchy changed from colonial patriarchy and slavery to emancipation, segregation, mass reform, rights movements, and continuing inequality.',periods:{B:'Race, gender, religion, class, slavery, and Native status structured colonial society.',C:'Republican ideals challenged hierarchy, but slavery, patriarchy, and property limits remained.',D:'Reform movements questioned slavery, gender inequality, alcohol, prisons, and education.',E:'Emancipation destroyed slavery, but Reconstruction and white resistance fought over Black citizenship.',F:'Jim Crow, class conflict, immigration, Native boarding schools, and gender roles structured society.',G:'Suffrage, migration, labor reform, New Deal welfare, and wartime roles altered social hierarchy.',H:'Civil rights, feminism, gay rights, student activism, and conservative backlash challenged older structures.',I:'Debates over race, gender, class, immigration, sexuality, education, and health care shaped social change.'}}
  ];
  var EVENTS=[
    {id:'jamestown',year:1607,period:'B',cat:'politics',title:'Jamestown Founded',desc:'First permanent English settlement. Established House of Burgesses (1619), first representative assembly in America.',sig:'Template for colonial governance; tobacco economy drove demand for enslaved labor.'},{id:'mayflower',year:1620,period:'B',cat:'politics',title:'Mayflower Compact',desc:'Pilgrims created a self-governing agreement before landing at Plymouth.',sig:'Foundation of democratic self-governance; foreshadowed constitutional thinking.'},{id:'rhode_island',year:1636,period:'B',cat:'religion',title:'Rhode Island Founded',desc:'Roger Williams founded Rhode Island on principles of religious freedom and separation of church and state.',sig:'Established religious tolerance that influenced the First Amendment.'},{id:'navigation_acts',year:1651,period:'B',cat:'economy',title:'Navigation Acts',desc:'English Parliament required colonial goods to be shipped on English vessels and routed through England.',sig:'Bred colonial resentment of British economic control; early seeds of Revolutionary grievances.'},{id:'halfway_covenant',year:1662,period:'B',cat:'religion',title:'Halfway Covenant',desc:'Puritan churches allowed partial membership to second-generation Puritans who had not experienced conversion.',sig:'Signaled weakening of Puritan identity; tension between religious ideal and practical reality.'},{id:'king_philips_war',year:1675,period:'B',cat:'military',title:"King Philip's War",desc:'Metacom led Wampanoag and allied tribes against English settlers. Deadliest per-capita war in American history before Civil War.',sig:'Devastated Native power in New England; eliminated most tribal resistance to English expansion.'},{id:'bacons_rebellion',year:1676,period:'B',cat:'society',title:"Bacon's Rebellion",desc:"Nathaniel Bacon led armed revolt of frontier settlers and indentured servants against Virginia's colonial elite.",sig:'Frightened planters into replacing indentured servants with enslaved Africans - accelerated chattel slavery.'},{id:'pueblo_revolt',year:1680,period:'B',cat:'military',title:'Pueblo Revolt',desc:'Pope led Pueblo peoples in a coordinated uprising, driving Spanish colonizers out of New Mexico for 12 years.',sig:'Most successful Native revolt against European colonizers; demonstrated limits of Spanish imperial control.'},{id:'dominion_ne',year:1686,period:'B',cat:'politics',title:'Dominion of New England',desc:'James II consolidated New England colonies into one royal dominion, abolishing representative assemblies.',sig:"Colonial outrage at loss of self-governance; Glorious Revolution ended the Dominion."},{id:'glorious_rev',year:1689,period:'B',cat:'politics',title:'Glorious Revolution Effects',desc:"England's Glorious Revolution overthrew James II. Colonists in Boston, New York, and Maryland launched uprisings.",sig:'Restored colonial assemblies; reinforced belief in constitutional limits on royal power.'},{id:'salem_witchcraft',year:1692,period:'B',cat:'religion',title:'Salem Witch Trials',desc:'Hysteria in Salem led to 19 executions for witchcraft.',sig:'Exposed dangers of religious extremism and mass hysteria; led to skepticism of Puritan authority.'},{id:'great_awakening',year:1735,period:'B',cat:'religion',title:'First Great Awakening',desc:'Jonathan Edwards sparked colony-wide religious revival emphasizing personal faith over church authority.',sig:'Created shared colonial identity; challenged authority - groundwork for revolutionary defiance.'},{id:'fim_war',year:1763,period:'C',cat:'military',title:'French & Indian War Ends',desc:'Treaty of Paris ended war. Britain gained territory east of Mississippi but incurred massive debt.',sig:'New taxes to pay war debt sparked road to Revolution; Proclamation of 1763 blocked westward expansion.'},{id:'stamp_act',year:1765,period:'C',cat:'politics',title:'Stamp Act',desc:"First direct British tax on colonists. Sparked outrage over 'taxation without representation.'",sig:'Galvanized colonial resistance; Sons of Liberty formed; boycotts spread across colonies.'},{id:'boston_tea',year:1773,period:'C',cat:'politics',title:'Boston Tea Party',desc:'Colonists dumped 342 chests of British tea into Boston Harbor to protest the Tea Act.',sig:'Provoked Coercive Acts; pushed colonies toward revolution.'},{id:'declaration',year:1776,period:'C',cat:'politics',title:'Declaration of Independence',desc:'Jefferson declared independence, articulating Enlightenment ideals of natural rights, equality, and popular sovereignty.',sig:'Founding document of American democracy; influenced global democratic movements.'},{id:'shays',year:1786,period:'C',cat:'economy',title:"Shays' Rebellion",desc:'Massachusetts farmers revolted against state government over debt and taxes. Exposed weakness of Articles of Confederation.',sig:'Convinced founders to call Constitutional Convention; directly led to the U.S. Constitution.'},{id:'constitution',year:1789,period:'C',cat:'politics',title:'Constitution Ratified',desc:'Constitution replaced Articles of Confederation. Federal government with checks and balances established.',sig:'Most durable written constitution in history; foundation of American government.'},{id:'hamilton_plan',year:1791,period:'C',cat:'economy',title:"Hamilton's Financial Plan",desc:'Hamilton proposed national bank, assumption of state debts, tariffs, and support for manufacturing.',sig:'Established federal control of economy; Jefferson-Hamilton split created first American party system.'},{id:'louisiana',year:1803,period:'D',cat:'politics',title:'Louisiana Purchase',desc:'Jefferson purchased 828,000 sq mi from France for $15 million, doubling U.S. territory.',sig:'Opened vast western territory; raised slavery expansion debate; tested constitutional limits.'},{id:'war_1812_end',year:1814,period:'D',cat:'military',title:'War of 1812 Ends',desc:'Treaty of Ghent ended War of 1812; sparked American nationalism and Era of Good Feelings.',sig:'Confirmed U.S. sovereignty; American System (Clay).'},{id:'monroe_doctrine',year:1823,period:'D',cat:'military',title:'Monroe Doctrine',desc:'Monroe declared Western Hemisphere closed to European colonization.',sig:'Cornerstone of American foreign policy for 200 years; defined U.S. sphere of influence.'},{id:'second_awakening',year:1828,period:'D',cat:'religion',title:'Second Great Awakening',desc:"Wave of religious revivals fueled abolition, temperance, and women's rights movements.",sig:'Transformed American religion and social reform; created infrastructure for abolitionism.'},{id:'nat_turner',year:1831,period:'D',cat:'society',title:"Nat Turner's Revolt",desc:'Enslaved Virginian Nat Turner led deadliest slave revolt in U.S. history, killing 55 white Virginians.',sig:'Hardened Southern slave codes; strengthened abolitionist movement in North.'},{id:'jackson_bank',year:1832,period:'D',cat:'economy',title:'Jackson Destroys the Bank',desc:"Jackson vetoed recharter of Second Bank, calling it a 'monster' favoring elites.",sig:'Led to Panic of 1837; established Democrats as anti-bank party; expanded presidential veto power.'},{id:'trail_tears',year:1838,period:'D',cat:'society',title:'Trail of Tears',desc:'Forced relocation of Cherokee and other Five Civilized Tribes to Indian Territory. About 4,000 died.',sig:'Epitomized U.S. treatment of Native Americans; Jackson ignored Supreme Court ruling.'},{id:'seneca_falls',year:1848,period:'D',cat:'society',title:'Seneca Falls Convention',desc:'First women\'s rights convention. Stanton and Mott issued Declaration of Sentiments demanding equality.',sig:'Launched organized women\'s rights movement; set agenda for 72-year suffrage campaign.'},{id:'mex_war_end',year:1848,period:'E',cat:'military',title:'Mexican-American War Ends',desc:'Treaty of Guadalupe Hidalgo gave U.S. California and New Mexico. Reignited slavery expansion debate.',sig:'Wilmot Proviso, Compromise of 1850, Kansas-Nebraska Act, and Civil War flowed from this.'},{id:'uncle_tom',year:1852,period:'E',cat:'religion',title:"Uncle Tom's Cabin",desc:"Harriet Beecher Stowe's novel depicted brutal realities of slavery; sold 300,000 copies in first year.",sig:'Galvanized Northern anti-slavery sentiment; Lincoln reportedly called it the book that started the great war.'},{id:'republican_party',year:1854,period:'E',cat:'politics',title:'Republican Party Founded',desc:'Anti-slavery coalition formed after Kansas-Nebraska Act.',sig:'Realigned American politics; Lincoln won 1860 presidency as Republican.'},{id:'dred_scott',year:1857,period:'E',cat:'politics',title:'Dred Scott Decision',desc:'Supreme Court ruled enslaved people are not citizens; Congress cannot ban slavery in territories.',sig:'Inflamed sectional tensions; galvanized Northern Republicans; directly accelerated Civil War.'},{id:'civil_war',year:1861,period:'E',cat:'military',title:'Civil War Begins',desc:'Confederate attack on Fort Sumter began Civil War. Four years of devastating conflict over slavery.',sig:'Bloodiest war in American history; resolved slavery question and nature of the Union.'},{id:'homestead',year:1862,period:'E',cat:'economy',title:'Homestead Act',desc:'Federal law offered 160 acres of western land to settlers who improved it for 5 years.',sig:'Accelerated western settlement; shaped American mythology of self-reliance.'},{id:'emancipation',year:1863,period:'E',cat:'society',title:'Emancipation Proclamation',desc:"Lincoln declared enslaved people in Confederate states 'forever free.' Transformed the war.",sig:'Led to 13th Amendment; 200,000 Black soldiers joined Union Army.'},{id:'civil_war_end',year:1865,period:'E',cat:'military',title:'Civil War Ends',desc:'Lee surrendered at Appomattox. 13th Amendment abolished slavery. Lincoln assassinated.',sig:'Ended slavery; began Reconstruction.'},{id:'transcont_rr',year:1869,period:'F',cat:'economy',title:'Transcontinental Railroad',desc:'First transcontinental railroad completed. Built by Chinese and Irish immigrant laborers.',sig:'Transformed American economy; tied the nation together; accelerated industrial capitalism.'},{id:'reconstruction_ends',year:1877,period:'F',cat:'politics',title:'Reconstruction Ends',desc:'Compromise of 1877 awarded Hayes the presidency; federal troops withdrew from the South.',sig:"Betrayed Black Americans' Reconstruction gains; enabled decades of legal segregation."},{id:'afl',year:1886,period:'F',cat:'economy',title:'AFL Founded',desc:'Samuel Gompers founded American Federation of Labor, focusing on skilled workers.',sig:'Most significant labor organization of the era; shaped American labor movement for decades.'},{id:'sherman_antitrust',year:1890,period:'F',cat:'economy',title:'Sherman Anti-Trust Act',desc:'First federal law limiting monopolistic business practices.',sig:'First step in federal business regulation; later strengthened by Clayton Act and FTC.'},{id:'wounded_knee',year:1890,period:'F',cat:'military',title:'Wounded Knee Massacre',desc:'U.S. 7th Cavalry killed about 250 Lakota Sioux at Wounded Knee Creek, South Dakota.',sig:'Last major armed conflict between U.S. government and Native Americans.'},{id:'plessy',year:1896,period:'F',cat:'society',title:'Plessy v. Ferguson',desc:"Supreme Court upheld 'separate but equal' doctrine, legalizing racial segregation.",sig:'Legal foundation for Jim Crow for 58 years; overturned by Brown v. Board (1954).'},{id:'spanish_war',year:1898,period:'F',cat:'military',title:'Spanish-American War',desc:'Brief war with Spain; U.S. gained Philippines, Guam, Puerto Rico, and control of Cuba.',sig:'Launched U.S. as imperial power; sparked debate over American empire.'},{id:'progressive_era',year:1901,period:'G',cat:'politics',title:'Progressive Era Begins',desc:"TR's presidency: trust-busting, conservation, FDA, Pure Food and Drug Act.",sig:'Redefined federal role in regulating capitalism; ideological foundations for New Deal.'},{id:'the_jungle',year:1906,period:'G',cat:'religion',title:'The Jungle Published',desc:'Upton Sinclair exposed horrific meatpacking plant conditions. Led to Pure Food and Drug Act.',sig:'Classic muckraking journalism driving Progressive era policy reform.'},{id:'naacp',year:1909,period:'G',cat:'society',title:'NAACP Founded',desc:'W.E.B. Du Bois, Ida B. Wells, and others founded NAACP to fight legal discrimination through courts.',sig:'Most important civil rights organization; won Brown v. Board (1954).'},{id:'federal_reserve',year:1913,period:'G',cat:'economy',title:'Federal Reserve Created',desc:'Wilson signed Federal Reserve Act creating central banking system.',sig:'Transformed American monetary policy; helped manage economic crises.'},{id:'wwi',year:1917,period:'G',cat:'military',title:'U.S. Enters World War I',desc:'After years of neutrality, U.S. entered WWI following German submarine warfare and Zimmermann Telegram.',sig:"Made U.S. decisive in Allied victory; Wilson's 14 Points; Senate rejected League of Nations."},{id:'amendment_19',year:1920,period:'G',cat:'society',title:'19th Amendment Ratified',desc:'Women granted the right to vote after a 72-year suffrage campaign.',sig:'Largest single expansion of voting rights in U.S. history.'},{id:'scopes',year:1925,period:'G',cat:'religion',title:'Scopes Trial',desc:'Tennessee teacher tried for teaching evolution. Bryan vs. Darrow in nationally watched drama.',sig:'Illustrated clash between religious fundamentalism and modernism.'},{id:'great_depression',year:1929,period:'G',cat:'economy',title:'Great Depression Begins',desc:'Black Tuesday triggered Great Depression: 25% unemployment, bank failures, global collapse.',sig:'Worst economic catastrophe in American history; led to New Deal; redefined role of government.'},{id:'new_deal',year:1933,period:'G',cat:'economy',title:"FDR's New Deal",desc:'FDR launched CCC, PWA, TVA, FDIC, Social Security, and labor protections.',sig:'Radically expanded federal government; established welfare state.'},{id:'pearl_harbor',year:1941,period:'G',cat:'military',title:'Pearl Harbor Attacked',desc:'Japanese surprise attack on Pearl Harbor killed 2,400 Americans. U.S. declared war the next day.',sig:'Brought U.S. into WWII; mobilized entire American economy.'},{id:'wwii_end',year:1945,period:'G',cat:'military',title:'WWII Ends',desc:'Germany surrendered May 1945. Atomic bombs on Hiroshima and Nagasaki ended the war.',sig:'U.S. emerged as global superpower; atomic age began; Cold War immediately followed.'},{id:'truman_doctrine',year:1947,period:'H',cat:'military',title:'Truman Doctrine',desc:'Truman pledged U.S. support for free peoples resisting subjugation.',sig:'Foundation of Cold War containment policy; committed U.S. to global anti-communist role.'},{id:'marshall_plan',year:1947,period:'H',cat:'economy',title:'Marshall Plan',desc:'U.S. provided $13 billion to rebuild war-devastated Western European economies.',sig:'Prevented communist expansion in Western Europe; showed power of economic statecraft.'},{id:'nato_formed',year:1949,period:'H',cat:'military',title:'NATO Created',desc:'North Atlantic Treaty Organization formed as collective defense alliance against Soviet threat.',sig:'Most successful military alliance in history; still active and expanded after Cold War.'},{id:'brown_board',year:1954,period:'H',cat:'society',title:'Brown v. Board of Education',desc:'Supreme Court unanimously ruled school segregation unconstitutional.',sig:'Launched Civil Rights era; massive resistance from Southern states followed.'},{id:'mccarthy',year:1954,period:'H',cat:'politics',title:'McCarthy Censured',desc:'Sen. McCarthy censured after Army-McCarthy hearings turned public opinion against him.',sig:'Ended McCarthyism; demonstrated decisive power of television in American politics.'},{id:'sputnik',year:1957,period:'H',cat:'economy',title:'Sputnik - Space Race',desc:'Soviet Sputnik became world\'s first artificial satellite (Oct 1957). Shocked Americans.',sig:'Led to NASA, NSF funding, National Defense Education Act; intensified Cold War competition.'},{id:'cuban_missile',year:1962,period:'H',cat:'military',title:'Cuban Missile Crisis',desc:'13-day nuclear standoff after U.S. discovered Soviet missiles in Cuba.',sig:'Closest humanity came to nuclear war; led to Nuclear Test Ban Treaty.'},{id:'mlk_dream',year:1963,period:'H',cat:'society',title:"'I Have a Dream' Speech",desc:"King delivered 'I Have a Dream' at March on Washington before 250,000 people.",sig:'Defining moment of Civil Rights Movement; built moral pressure that drove Civil Rights Act.'},{id:'civil_rights_act',year:1964,period:'H',cat:'society',title:'Civil Rights Act Signed',desc:'LBJ signed Civil Rights Act of 1964, banning discrimination in public accommodations and employment.',sig:'Ended legal segregation; split Democratic Party; transformed American society.'},{id:'tet',year:1968,period:'H',cat:'military',title:'Tet Offensive',desc:'North Vietnamese surprise attack on South Vietnamese cities. Military failure but psychological turning point.',sig:'Turned American public against Vietnam War; LBJ declined re-election.'},{id:'apollo_11',year:1969,period:'H',cat:'economy',title:'Apollo 11 Moon Landing',desc:'Neil Armstrong and Buzz Aldrin landed on the moon July 20, 1969.',sig:"Fulfilled Kennedy's challenge; demonstrated U.S. technological superiority in Cold War."},{id:'nixon_china',year:1972,period:'H',cat:'military',title:'Nixon Opens China',desc:"Nixon's historic visit to China established diplomatic relations for the first time since 1949.",sig:'Changed global Cold War dynamic; detente with USSR followed.'},{id:'inf_treaty',year:1987,period:'I',cat:'military',title:'INF Treaty Signed',desc:'Reagan and Gorbachev signed INF Treaty, eliminating entire class of nuclear weapons.',sig:'Breakthrough in nuclear arms reduction; signaled approaching end of Cold War.'},{id:'ussr_dissolved',year:1991,period:'I',cat:'military',title:'Soviet Union Dissolved',desc:'Soviet Union officially dissolved December 25, 1991. Cold War ended.',sig:'End of Cold War; U.S. became sole superpower.'},{id:'nine_eleven',year:2001,period:'I',cat:'military',title:'September 11 Attacks',desc:'Al-Qaeda attacked World Trade Center and Pentagon, killing 2,977.',sig:'USA PATRIOT Act; Afghanistan and Iraq wars; DHS created.'},{id:'financial_crisis',year:2008,period:'I',cat:'economy',title:'2008 Financial Crisis',desc:'Worst economic crisis since Great Depression. Barack Obama elected first Black president.',sig:'TARP bailout; Tea Party movement; deepened partisan polarization.'},{id:'aca',year:2010,period:'I',cat:'politics',title:'Affordable Care Act',desc:'Obama signed ACA, largest expansion of health care coverage since Medicare and Medicaid (1965).',sig:'Covered 20+ million uninsured Americans; polarized politics; survived multiple repeal attempts.'}
  ];
  var CONNECTIONS=[
    ['navigation_acts','stamp_act','Mercantilist control to taxation revolt'],
    ['bacons_rebellion','jamestown','Indentured unrest to shift to enslaved labor'],
    ['king_philips_war','bacons_rebellion','Frontier conflict fueled colonial tensions'],
    ['glorious_rev','constitution','Constitutional limits on kings to American constitutionalism'],
    ['halfway_covenant','great_awakening','Puritan decline to Great Awakening revival'],
    ['salem_witchcraft','great_awakening','Religious hysteria to Great Awakening reform'],
    ['dominion_ne','glorious_rev','Colonists overthrew Dominion during Glorious Revolution'],
    ['fim_war','stamp_act','War debt to Britain taxed colonies'],
    ['stamp_act','boston_tea','Tax protests escalated into direct action'],
    ['boston_tea','declaration','Colonial resistance to independence declared'],
    ['great_awakening','declaration','Religious revival fueled revolutionary spirit'],
    ['great_awakening','second_awakening','1st Awakening paved way for 2nd'],
    ['shays','constitution','Economic unrest to stronger federal government'],
    ['constitution','hamilton_plan',"New government to Hamilton's economic system"],
    ['hamilton_plan','jackson_bank','National bank to Jacksonian populist backlash'],
    ['second_awakening','seneca_falls',"Reform movement spawned women's rights"],
    ['second_awakening','nat_turner','Abolitionist fervor inspired slave resistance'],
    ['uncle_tom','civil_war','Galvanized Northern anti-slavery opinion'],
    ['dred_scott','civil_war','Legal crisis made compromise impossible'],
    ['nat_turner','emancipation','Slave resistance contributed to emancipation'],
    ['emancipation','civil_war_end','Emancipation Proclamation to 13th Amendment'],
    ['civil_war_end','reconstruction_ends','Reconstruction promised rights, then betrayed'],
    ['reconstruction_ends','plessy','End of Reconstruction to Jim Crow legalized'],
    ['plessy','brown_board','Separate but equal overturned 58 years later'],
    ['naacp','brown_board',"NAACP's legal strategy won Brown v. Board"],
    ['brown_board','civil_rights_act','Legal victory built toward legislative victory'],
    ['mlk_dream','civil_rights_act','March on Washington to Civil Rights Act'],
    ['seneca_falls','amendment_19','72-year campaign: Seneca Falls to 19th Amendment'],
    ['sherman_antitrust','federal_reserve','Progressive regulation expanded government role'],
    ['the_jungle','progressive_era','Muckraking journalism drove Progressive reform'],
    ['great_depression','new_deal','Depression to New Deal expanded federal role'],
    ['pearl_harbor','wwii_end','Pearl Harbor mobilized U.S. to WWII victory'],
    ['wwii_end','truman_doctrine','WWII ends to Cold War containment begins'],
    ['marshall_plan','nato_formed','Economic reconstruction followed by military alliance'],
    ['sputnik','apollo_11','Sputnik challenge to Moon landing 12 years later'],
    ['cuban_missile','inf_treaty','Nuclear standoff to decades of arms reduction'],
    ['inf_treaty','ussr_dissolved','Arms reduction and pressure to Soviet collapse'],
    ['tet','nixon_china','Vietnam trauma shifted U.S. toward diplomacy']
  ];

  var SVG_W=5000,MIN_YEAR=1590,MAX_YEAR=2025,LANE_H=175,HEADER_H=110,PAD_X=90;
  var SVG_H=HEADER_H+5*LANE_H+30;
  var tlSelected=null,tlPeriod='all';

  var catMap={};
  CATS.forEach(function(c){catMap[c.id]=c;});
  var evtMap={};
  EVENTS.forEach(function(e){evtMap[e.id]=e;});

  // Piecewise mapping: each era gets width proportional to its event count
  // so dense periods (Civil War, Cold War) get more pixel space per year
  function yearToX(yr){
    var segs=[
      {y0:1590,y1:1607,w:1},  // pre-colonial stub
      {y0:1607,y1:1754,w:12}, // B Colonial
      {y0:1754,y1:1800,w:7},  // C Revolution
      {y0:1800,y1:1848,w:8},  // D Early Republic
      {y0:1848,y1:1877,w:8},  // E Civil War
      {y0:1877,y1:1898,w:7},  // F Gilded Age
      {y0:1898,y1:1945,w:11}, // G Progressive/WWII
      {y0:1945,y1:1980,w:12}, // H Cold War
      {y0:1980,y1:2025,w:5}   // I Modern
    ];
    var totalW=segs.reduce(function(s,sg){return s+sg.w;},0);
    var usable=SVG_W-2*PAD_X;
    var cx=PAD_X;
    for(var i=0;i<segs.length;i++){
      var sg=segs[i];
      var sw=sg.w/totalW*usable;
      if(yr<=sg.y1||i===segs.length-1){
        var t=(Math.max(sg.y0,Math.min(sg.y1,yr))-sg.y0)/(sg.y1-sg.y0);
        return cx+t*sw;
      }
      cx+=sw;
    }
    return PAD_X+usable;
  }
  function catToY(id){var i=CATS.findIndex(function(c){return c.id===id;});return HEADER_H+i*LANE_H+LANE_H/2;}
  function getCat(id){return catMap[id]||CATS[0];}
  function bezier(x1,y1,x2,y2){
    var mx=(x1+x2)/2;
    if(Math.abs(y1-y2)<5){var arc=-Math.max(32,Math.min(60,Math.abs(x2-x1)*0.28));return 'M'+x1+','+y1+' C'+mx+','+(y1+arc)+' '+mx+','+(y2+arc)+' '+x2+','+y2;}
    return 'M'+x1+','+y1+' C'+mx+','+y1+' '+mx+','+y2+' '+x2+','+y2;
  }
  function splitTitle(title){
    var words=title.split(' '),lines=[],cur='';
    words.forEach(function(w){if((cur+' '+w).trim().length>13&&cur){lines.push(cur);cur=w;}else{cur=(cur+' '+w).trim();}});
    if(cur)lines.push(cur);
    return lines;
  }

  function visibleEvents(){
    return tlPeriod==='all'?EVENTS:EVENTS.filter(function(e){return e.period===tlPeriod;});
  }
  function visibleConns(evts){
    var ids=new Set(evts.map(function(e){return e.id;}));
    return CONNECTIONS.filter(function(c){return ids.has(c[0])&&ids.has(c[1]);});
  }
  function selConnSet(){
    if(!tlSelected)return new Set();
    var s=new Set();
    CONNECTIONS.forEach(function(c){if(c[0]===tlSelected||c[1]===tlSelected){s.add(c[0]);s.add(c[1]);}});
    return s;
  }
  function themeEvolutionHTML(){
    var period=PERIODS.find(function(p){return p.id===tlPeriod;})||PERIODS[0];
    var label=tlPeriod==='all'?'Long arc across the full timeline':period.label+' theme changes';
    var html='<div style="padding:14px 28px 16px;border-bottom:1px solid rgba(59,130,246,0.08);background:linear-gradient(180deg,rgba(59,130,246,0.045),rgba(0,0,0,0.10))">';
    html+='<div style="display:flex;justify-content:space-between;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:10px">';
    html+='<div><div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(147,197,253,0.62);font-family:\'JetBrains Mono\',monospace">Theme evolution</div><div style="font-family:\'Playfair Display\',serif;font-size:17px;color:#e8edf5;font-weight:700;margin-top:3px">'+label+'</div></div>';
    html+='<div style="font-size:11px;color:rgba(136,153,180,0.72);font-family:\'Source Serif 4\',Georgia,serif;max-width:420px;line-height:1.45">Use the period buttons above to see how every APUSH theme changes over time.</div>';
    html+='</div>';
    html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:9px">';
    THEMES.forEach(function(t){
      var text=tlPeriod==='all'?t.arc:(t.periods[tlPeriod]||t.arc);
      html+='<div style="border:1px solid '+t.color+'33;background:rgba(255,255,255,0.026);border-radius:10px;padding:11px 12px;min-height:118px">';
      html+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:6px"><span style="width:8px;height:8px;border-radius:50%;background:'+t.color+';box-shadow:0 0 12px '+t.color+'55"></span><strong style="font-family:\'Playfair Display\',serif;font-size:13px;color:#f8fbff">'+t.label+'</strong></div>';
      html+='<p style="margin:0;color:rgba(232,237,245,0.76);font-size:13px;line-height:1.52">'+text+'</p>';
      html+='</div>';
    });
    html+='</div></div>';
    return html;
  }

  function buildSVG(evts,conns){
    var sc=selConnSet();
    var RULER=[];for(var y=MIN_YEAR;y<=MAX_YEAR;y+=10)RULER.push(y);
    var GRID=[1650,1700,1750,1800,1850,1900,1950,2000];
    var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+SVG_W+'" height="'+SVG_H+'" style="display:block">';

    // defs - arrowheads
    svg+='<defs>';
    CATS.forEach(function(c){
      svg+='<marker id="tl-arr-'+c.id+'" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill="'+c.color+'" opacity="0.85"/></marker>';
    });
    svg+='</defs>';

    // period bands
    PERIODS.filter(function(p){return p.id!=='all';}).forEach(function(p,i){
      var x1=yearToX(p.start),x2=yearToX(p.end);
      svg+='<rect x="'+x1+'" y="0" width="'+(x2-x1)+'" height="'+SVG_H+'" fill="'+(i%2===0?'rgba(255,255,255,0.012)':'rgba(0,0,0,0.01)')+'"/>';
      svg+='<text x="'+(x1+(x2-x1)/2)+'" y="28" text-anchor="middle" fill="rgba(59,130,246,0.22)" font-size="9" font-family="\'Playfair Display\',serif" letter-spacing="0.04em">'+p.label+'</text>';
      svg+='<line x1="'+x1+'" y1="0" x2="'+x1+'" y2="'+SVG_H+'" stroke="rgba(59,130,246,0.1)" stroke-width="1"/>';
    });

    // lane backgrounds & guides
    CATS.forEach(function(c,i){
      svg+='<rect x="0" y="'+(HEADER_H+i*LANE_H)+'" width="'+SVG_W+'" height="'+LANE_H+'" fill="'+c.bg+'"/>';
      svg+='<line x1="'+PAD_X+'" y1="'+(HEADER_H+i*LANE_H+LANE_H/2)+'" x2="'+(SVG_W-20)+'" y2="'+(HEADER_H+i*LANE_H+LANE_H/2)+'" stroke="'+c.color+'" stroke-width="0.4" stroke-opacity="0.18" stroke-dasharray="2 10"/>';
      svg+='<text x="8" y="'+(HEADER_H+i*LANE_H+LANE_H/2+4)+'" fill="'+c.color+'" font-size="11" font-family="\'Playfair Display\',serif" letter-spacing="0.03em" opacity="0.5">'+c.label+'</text>';
      svg+='<line x1="0" y1="'+(HEADER_H+(i+1)*LANE_H)+'" x2="'+SVG_W+'" y2="'+(HEADER_H+(i+1)*LANE_H)+'" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';
    });

    // ruler
    RULER.forEach(function(y){
      var x=yearToX(y),maj=y%50===0,med=y%25===0&&!maj;
      svg+='<line x1="'+x+'" y1="'+(HEADER_H-(maj?24:med?15:8))+'" x2="'+x+'" y2="'+HEADER_H+'" stroke="'+(maj?'rgba(59,130,246,0.5)':med?'rgba(59,130,246,0.22)':'rgba(255,255,255,0.08)')+'" stroke-width="'+(maj?1.5:0.7)+'"/>';
      if(maj)svg+='<text x="'+x+'" y="'+(HEADER_H-28)+'" text-anchor="middle" fill="rgba(59,130,246,0.7)" font-size="13" font-family="\'Playfair Display\',serif" font-weight="600">'+y+'</text>';
      if(med)svg+='<text x="'+x+'" y="'+(HEADER_H-18)+'" text-anchor="middle" fill="rgba(59,130,246,0.3)" font-size="9" font-family="\'Playfair Display\',serif">'+y+'</text>';
    });
    GRID.forEach(function(y){
      svg+='<line x1="'+yearToX(y)+'" y1="'+HEADER_H+'" x2="'+yearToX(y)+'" y2="'+SVG_H+'" stroke="rgba(255,255,255,0.025)" stroke-width="1" stroke-dasharray="3 9"/>';
    });

    // connections
    conns.forEach(function(c){
      var fr=evtMap[c[0]],to=evtMap[c[1]];
      if(!fr||!to)return;
      var x1=yearToX(fr.year),y1=catToY(fr.cat),x2=yearToX(to.year),y2=catToY(to.cat);
      var fc=getCat(fr.cat);
      var hi=tlSelected&&(tlSelected===c[0]||tlSelected===c[1]);
      var op=tlSelected?(hi?0.85:0.12):0.17;
      svg+='<path d="'+bezier(x1,y1,x2,y2)+'" stroke="'+(hi?fc.color:'#8899aa')+'" stroke-width="'+(hi?2.5:0.9)+'" stroke-opacity="'+op+'" fill="none"'+(hi?' marker-end="url(#tl-arr-'+fc.id+')"':'')+' style="pointer-events:none"/>';
    });

    // event nodes
    evts.forEach(function(ev,idx){
      var cat=getCat(ev.cat),x=yearToX(ev.year),y=catToY(ev.cat);
      var isSel=tlSelected===ev.id;
      var isDim=false;
      var r=isSel?13:9,above=idx%2===0;
      var yearY=above?y-r-14:y+r+24,labelY=above?y-r-26:y+r+36;
      var lines=splitTitle(ev.title);
      var op=isDim?0.12:1;
      svg+='<g class="tl-evt" data-id="'+ev.id+'" style="cursor:pointer;opacity:'+op+'">';
      if(isSel){svg+='<circle cx="'+x+'" cy="'+y+'" r="26" fill="'+cat.color+'" opacity="0.12"/><circle cx="'+x+'" cy="'+y+'" r="18" fill="none" stroke="'+cat.color+'" stroke-width="1" opacity="0.35"/>';}
      svg+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(isSel?cat.color:'rgba(12,15,26,0.92)')+'" stroke="'+cat.color+'" stroke-width="'+(isSel?0:2)+'"/'+'>';
      svg+='<text x="'+x+'" y="'+yearY+'" text-anchor="middle" fill="'+(isDim?'rgba(255,255,255,0.1)':cat.color)+'" font-size="10" font-family="\'Playfair Display\',serif" font-weight="700">'+ev.year+'</text>';
      lines.forEach(function(line,li){
        var ty=above?labelY-(lines.length-1-li)*12:labelY+li*12;
        svg+='<text x="'+x+'" y="'+ty+'" text-anchor="middle" fill="'+(isDim?'rgba(255,255,255,0.06)':(isSel?'#fff':'rgba(232,237,245,0.8)'))+'" font-size="10.5" font-family="\'Source Serif 4\',Georgia,serif" font-style="italic" font-weight="'+(isSel?600:400)+'">'+line+'</text>';
      });
      svg+='</g>';
    });

    svg+='</svg>';
    return svg;
  }

  function buildInfoPanel(){
    if(!tlSelected){
      return '<div style="padding:20px 28px;text-align:center;color:rgba(136,153,180,0.45);font-size:13px;font-family:\'Playfair Display\',serif;letter-spacing:0.04em;font-style:italic">Click any event to view details and connections</div>';
    }
    var ev=evtMap[tlSelected];
    if(!ev)return '';
    var cat=getCat(ev.cat);
    var period=PERIODS.find(function(p){return p.id===ev.period;})||PERIODS[0];
    var conns=CONNECTIONS.filter(function(c){return c[0]===tlSelected||c[1]===tlSelected;});

    var html='<div style="border-top:2px solid '+cat.color+';background:rgba(255,255,255,0.025);padding:18px 28px 24px">';
    html+='<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">';
    html+='<span style="background:'+cat.color+';color:#fff;padding:4px 12px;border-radius:5px;font-size:11px;font-family:\'Playfair Display\',serif;font-weight:700;letter-spacing:0.03em">'+cat.label+'</span>';
    html+='<span style="border:1px solid rgba(59,130,246,0.3);color:#3b82f6;padding:4px 12px;border-radius:5px;font-size:11px;font-family:\'Playfair Display\',serif">'+period.label+' · '+ev.year+'</span>';
    html+='</div>';
    html+='<h2 style="font-family:\'Playfair Display\',serif;font-size:20px;font-weight:700;color:#e8edf5;margin:0 0 10px">'+ev.title+'</h2>';
    html+='<p style="margin:0 0 8px;font-size:16px;line-height:1.75;color:rgba(232,237,245,0.85)">'+ev.desc+'</p>';
    if(ev.sig){html+='<p style="margin:0;font-size:14px;color:rgba(136,153,180,0.8);font-style:italic"><span style="color:'+cat.color+';font-style:normal;font-weight:600">Significance: </span>'+ev.sig+'</p>';}

    if(conns.length){
      html+='<div style="margin-top:16px">';
      html+='<div style="font-size:10px;font-family:\'Playfair Display\',serif;color:rgba(59,130,246,0.5);letter-spacing:0.08em;margin-bottom:10px;text-transform:uppercase">Connections - click to navigate</div>';
      html+='<div style="display:flex;gap:8px;flex-wrap:wrap">';
      conns.forEach(function(c){
        var isFrom=c[0]===tlSelected,oId=isFrom?c[1]:c[0],other=evtMap[oId];
        if(!other)return;
        var oCat=getCat(other.cat);
        html+='<button class="tl-conn-btn" data-id="'+oId+'" style="background:rgba(59,130,246,0.04);border:1px solid '+oCat.color+'44;color:rgba(232,237,245,0.85);padding:10px 14px;border-radius:8px;cursor:pointer;font-size:14px;text-align:left;font-family:\'Source Serif 4\',Georgia,serif;max-width:240px;line-height:1.4">';
        html+='<div style="color:'+oCat.color+';font-family:\'Playfair Display\',serif;font-size:10px;letter-spacing:0.04em;margin-bottom:3px">'+(isFrom?'-> Influenced':'<- Influenced by')+' · '+other.year+'</div>';
        html+='<div style="font-weight:600;font-size:15px;margin-bottom:2px">'+other.title+'</div>';
        html+='<div style="color:rgba(136,153,180,0.6);font-size:12px">'+c[2]+'</div>';
        html+='</button>';
      });
      html+='</div></div>';
    }
    html+='</div>';
    return html;
  }

  function renderTimeline(){
    var savedScroll=0;
    var existingWrap=root.querySelector('#tl-svg-wrap');
    if(existingWrap) savedScroll=existingWrap.scrollLeft;

    var evts=visibleEvents(),conns=visibleConns(evts);
    var headerHTML='<div class="bc-page-head" style="padding-left:28px;padding-right:28px">';
    headerHTML+='<div class="bc-grid-bg" aria-hidden="true"></div>';
    headerHTML+='<div class="bc-page-head-inner">';
    headerHTML+='<div>';
    headerHTML+='<span class="bc-label">|MODULE_TL_ - APUSH</span>';
    headerHTML+='<h1>The <em>Timeline.</em></h1>';
    headerHTML+='<p class="bc-page-sub">'+evts.length+' events across 5 categories - click any event to explore connections and significance.</p>';
    headerHTML+='<div class="bc-page-meta">';
    headerHTML+='<span class="bc-pill">'+evts.length+'_EVENTS</span>';
    headerHTML+='<span class="bc-pill">5_CATEGORIES</span>';
    headerHTML+='<span class="bc-pill">8_THEMES</span>';
    headerHTML+='<span class="bc-pill">1607->PRESENT</span>';
    if(tlSelected){headerHTML+='<button id="tl-clear" style="background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.3);color:rgba(59,130,246,0.8);padding:5px 14px;border-radius:6px;cursor:pointer;font-size:11px;font-family:\'Playfair Display\',serif;margin-left:4px">Clear selection</button>';}
    headerHTML+='</div>';
    headerHTML+='</div>';
    headerHTML+='<div class="bc-mini-orb"><svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;overflow:visible"><defs><radialGradient id="bg-og-tl" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(59,130,246,1)" stop-opacity="0.22"/><stop offset="100%" stop-color="transparent"/></radialGradient><radialGradient id="gl-og-tl" cx="32%" cy="28%" r="72%"><stop offset="0%" stop-color="rgba(59,130,246,1)" stop-opacity="0.14"/><stop offset="100%" stop-color="rgba(4,7,18,0.97)"/></radialGradient></defs><circle cx="100" cy="100" r="94" fill="url(#bg-og-tl)"/><circle cx="100" cy="100" r="90" fill="url(#gl-og-tl)" stroke="rgba(59,130,246,1)" stroke-opacity="0.35" stroke-width="1.5"/><ellipse cx="76" cy="60" rx="40" ry="22" fill="rgba(255,255,255,0.04)" transform="rotate(-18 76 60)"/><defs><radialGradient id="dg" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="rgba(147,197,253,0.94)"/><stop offset="100%" stop-color="rgba(37,99,235,0.82)"/></radialGradient><radialGradient id="dgs" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="rgba(255,255,255,0.96)"/><stop offset="100%" stop-color="rgba(59,130,246,0.9)"/></radialGradient></defs><line x1="42" y1="107" x2="164" y2="107" stroke="rgba(0,0,0,0.32)" stroke-width="7" stroke-linecap="round"/><line x1="40" y1="103" x2="158" y2="103" stroke="rgba(59,130,246,0.52)" stroke-width="4.5" stroke-linecap="round"/><polygon points="154,95 172,103 154,111" fill="rgba(59,130,246,0.9)"/><circle cx="54" cy="106" r="10" fill="rgba(0,0,0,0.3)" transform="translate(2,3)"/><circle cx="54" cy="103" r="10" fill="url(#dg)" stroke="rgba(147,197,253,0.68)" stroke-width="1.5"/><circle cx="50" cy="99" r="3.5" fill="rgba(255,255,255,0.32)"/><circle cx="86" cy="106" r="10" fill="rgba(0,0,0,0.3)" transform="translate(2,3)"/><circle cx="86" cy="103" r="10" fill="url(#dg)" stroke="rgba(147,197,253,0.68)" stroke-width="1.5"/><circle cx="82" cy="99" r="3.5" fill="rgba(255,255,255,0.32)"/><circle cx="118" cy="107" r="14" fill="rgba(0,0,0,0.32)" transform="translate(2,4)"/><circle cx="118" cy="103" r="14" fill="url(#dgs)" stroke="rgba(255,255,255,0.72)" stroke-width="2"/><circle cx="113" cy="97" r="4.5" fill="rgba(255,255,255,0.4)"/><circle cx="150" cy="106" r="10" fill="rgba(0,0,0,0.3)" transform="translate(2,3)"/><circle cx="150" cy="103" r="10" fill="url(#dg)" stroke="rgba(147,197,253,0.68)" stroke-width="1.5"/><circle cx="146" cy="99" r="3.5" fill="rgba(255,255,255,0.32)"/><line x1="54" y1="88" x2="54" y2="78" stroke="rgba(59,130,246,0.58)" stroke-width="2.2" stroke-linecap="round"/><line x1="86" y1="88" x2="86" y2="80" stroke="rgba(59,130,246,0.42)" stroke-width="1.8" stroke-linecap="round"/><line x1="118" y1="84" x2="118" y2="70" stroke="rgba(59,130,246,0.82)" stroke-width="2.8" stroke-linecap="round"/><line x1="150" y1="88" x2="150" y2="80" stroke="rgba(59,130,246,0.42)" stroke-width="1.8" stroke-linecap="round"/><text x="54" y="140" text-anchor="middle" font-size="11" fill="rgba(136,153,180,0.75)" font-family="\'Playfair Display\',serif">1776</text><text x="86" y="140" text-anchor="middle" font-size="11" fill="rgba(136,153,180,0.75)" font-family="\'Playfair Display\',serif">1865</text><text x="118" y="140" text-anchor="middle" font-size="11" fill="rgba(147,197,253,0.96)" font-family="\'Playfair Display\',serif" font-weight="700">1945</text><text x="150" y="140" text-anchor="middle" font-size="11" fill="rgba(136,153,180,0.75)" font-family="\'Playfair Display\',serif">2001</text></svg></div>';
    headerHTML+='</div></div>';

    var filterHTML='<div style="padding:8px 28px;display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid rgba(59,130,246,0.08);background:rgba(59,130,246,0.03)">';
    PERIODS.forEach(function(p){
      var active=tlPeriod===p.id;
      filterHTML+='<button class="tl-period-btn" data-period="'+p.id+'" style="padding:6px 13px;background:'+(active?'#3b82f6':'rgba(59,130,246,0.05)')+';color:'+(active?'#fff':'#8899b4')+';border:1px solid '+(active?'#3b82f6':'rgba(59,130,246,0.18)')+';border-radius:6px;cursor:pointer;font-size:11px;font-family:\'Playfair Display\',serif;font-weight:'+(active?700:400)+';white-space:nowrap;transition:all .15s">'+p.label+'</button>';
    });
    filterHTML+='</div>';

    var themesHTML=themeEvolutionHTML();
    var legendHTML='<div style="padding:7px 28px;display:flex;gap:18px;flex-wrap:wrap;border-bottom:1px solid rgba(59,130,246,0.06);background:rgba(0,0,0,0.12);align-items:center">';
    CATS.forEach(function(c){
      legendHTML+='<div style="display:flex;align-items:center;gap:6px"><div style="width:9px;height:9px;border-radius:50%;background:'+c.color+'"></div><span style="font-size:11px;color:rgba(136,153,180,0.7);font-family:\'Playfair Display\',serif">'+c.label+'</span></div>';
    });
    legendHTML+='<span style="margin-left:auto;font-size:10px;color:rgba(136,153,180,0.35);font-family:\'Playfair Display\',serif">â—€ scroll â–¶</span></div>';

    var svgWrap='<div id="tl-svg-wrap" style="overflow-x:auto;overflow-y:hidden;cursor:grab;">'+buildSVG(evts,conns)+'</div>';

    root.innerHTML='<div id="tl-outer" style="background:#0c0f1a;min-height:100vh;color:#e8edf5;display:flex;flex-direction:column;position:relative">'+headerHTML+filterHTML+themesHTML+legendHTML+svgWrap+'</div>';
    attachHandlers();
    var newWrap=root.querySelector('#tl-svg-wrap');
    if(newWrap && savedScroll) newWrap.scrollLeft=savedScroll;
    renderTooltip();
  }

  function positionTooltip(){
    var tip=root.querySelector('#tl-tooltip');
    if(!tip||!tlSelected) return;
    var ev=evtMap[tlSelected];
    if(!ev) return;
    var outer=root.querySelector('#tl-outer');
    var wrap=root.querySelector('#tl-svg-wrap');
    if(!outer||!wrap) return;
    var outerRect=outer.getBoundingClientRect();
    var wrapRect=wrap.getBoundingClientRect();
    var dotX=yearToX(ev.year);
    var dotY=catToY(ev.cat);
    var visX=wrapRect.left-outerRect.left+dotX-wrap.scrollLeft;
    var tw=tip.offsetWidth||320;
    var left=Math.max(8,Math.min(visX-tw/2,outerRect.width-tw-8));
    var th=tip.offsetHeight||220;
    var wrapTop=wrapRect.top-outerRect.top;
    var top=Math.max(wrapTop+10, wrapTop+dotY-th-28);
    tip.style.left=left+'px';
    tip.style.top=top+'px';
  }

  function renderTooltip(){
    var outer=root.querySelector('#tl-outer');
    if(!outer) return;
    var existing=outer.querySelector('#tl-tooltip');
    if(existing) existing.remove();
    if(!tlSelected) return;
    var ev=evtMap[tlSelected];
    if(!ev) return;
    var cat=getCat(ev.cat);
    var period=PERIODS.find(function(p){return p.id===ev.period;})||PERIODS[0];
    var conns=CONNECTIONS.filter(function(c){return c[0]===tlSelected||c[1]===tlSelected;});

    var tip=document.createElement('div');
    tip.id='tl-tooltip';
    tip.style.cssText='position:absolute;width:310px;background:rgba(12,15,26,0.97);border:1px solid '+cat.color+';border-radius:12px;padding:16px 18px 14px;z-index:20;box-shadow:0 8px 40px rgba(0,0,0,0.65),0 0 0 1px rgba(255,255,255,0.04);left:0;top:0';

    var html='<button id="tl-tt-close" style="position:absolute;top:10px;right:12px;background:transparent;border:none;color:rgba(136,153,180,0.5);cursor:pointer;font-size:18px;line-height:1;padding:2px 4px">x</button>';
    html+='<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;padding-right:24px">';
    html+='<span style="background:'+cat.color+';color:#fff;padding:3px 9px;border-radius:4px;font-size:10px;font-family:\'Playfair Display\',serif;font-weight:700">'+cat.label+'</span>';
    html+='<span style="border:1px solid rgba(59,130,246,0.3);color:#3b82f6;padding:3px 9px;border-radius:4px;font-size:10px;font-family:\'Playfair Display\',serif">'+period.label+' · '+ev.year+'</span>';
    html+='</div>';
    html+='<h3 style="font-family:\'Playfair Display\',serif;font-size:16px;font-weight:700;color:#e8edf5;margin:0 0 7px;line-height:1.3">'+ev.title+'</h3>';
    html+='<p style="margin:0 0 7px;font-size:13px;line-height:1.6;color:rgba(232,237,245,0.85)">'+ev.desc+'</p>';
    if(ev.sig){html+='<p style="margin:0 0 10px;font-size:12px;color:rgba(136,153,180,0.8);font-style:italic;line-height:1.5"><span style="color:'+cat.color+';font-style:normal;font-weight:600">Significance: </span>'+ev.sig+'</p>';}
    if(conns.length){
      html+='<div style="font-size:9px;font-family:\'Playfair Display\',serif;color:rgba(59,130,246,0.5);letter-spacing:0.08em;margin-bottom:7px;text-transform:uppercase">Connections</div>';
      html+='<div style="display:flex;flex-direction:column;gap:5px">';
      conns.forEach(function(c){
        var isFrom=c[0]===tlSelected,oId=isFrom?c[1]:c[0],other=evtMap[oId];
        if(!other) return;
        var oCat=getCat(other.cat);
        html+='<button class="tl-conn-btn" data-id="'+oId+'" style="background:rgba(59,130,246,0.04);border:1px solid '+oCat.color+'33;color:rgba(232,237,245,0.85);padding:7px 10px;border-radius:7px;cursor:pointer;font-size:12px;text-align:left;font-family:\'Source Serif 4\',Georgia,serif;line-height:1.4;width:100%">';
        html+='<div style="color:'+oCat.color+';font-family:\'Playfair Display\',serif;font-size:9px;letter-spacing:0.04em;margin-bottom:1px">'+(isFrom?'-> Influenced':'<- Influenced by')+' · '+other.year+'</div>';
        html+='<div style="font-weight:600">'+other.title+'</div>';
        html+='</button>';
      });
      html+='</div>';
    }
    tip.innerHTML=html;
    outer.appendChild(tip);

    // Close button
    tip.querySelector('#tl-tt-close').addEventListener('click',function(e){
      e.stopPropagation();tlSelected=null;renderTimeline();
    });
    // Connection buttons
    tip.querySelectorAll('.tl-conn-btn').forEach(function(b){
      b.addEventListener('click',function(e){
        e.stopPropagation();tlSelected=this.dataset.id;renderTimeline();
      });
    });

    // Position after paint
    requestAnimationFrame(positionTooltip);
  }

  function attachHandlers(){
    // Drag-to-scroll on SVG wrapper
    var wrap=root.querySelector('#tl-svg-wrap');
    if(wrap){
      var isDragging=false,startX=0,scrollLeft=0,moved=false;
      wrap.addEventListener('mousedown',function(e){
        isDragging=true;moved=false;startX=e.pageX-wrap.offsetLeft;scrollLeft=wrap.scrollLeft;wrap.style.cursor='grabbing';e.preventDefault();
      });
      window.addEventListener('mousemove',function(e){
        if(!isDragging)return;
        var dx=e.pageX-wrap.offsetLeft-startX;
        if(Math.abs(dx)>4)moved=true;
        wrap.scrollLeft=scrollLeft-dx;
      });
      window.addEventListener('mouseup',function(){
        if(isDragging){isDragging=false;wrap.style.cursor='grab';}
      });
      wrap.addEventListener('click',function(e){
        if(moved){e.stopPropagation();moved=false;}
      },true);
      // Touch
      wrap.addEventListener('touchstart',function(e){
        startX=e.touches[0].pageX;scrollLeft=wrap.scrollLeft;moved=false;
      },{passive:true});
      wrap.addEventListener('touchmove',function(e){
        var dx=e.touches[0].pageX-startX;
        if(Math.abs(dx)>4){moved=true;wrap.scrollLeft=scrollLeft-dx;}
      },{passive:true});
      // Reposition tooltip on scroll
      wrap.addEventListener('scroll', positionTooltip, {passive:true});
    }
    // Event nodes
    root.querySelectorAll('.tl-evt').forEach(function(g){
      g.addEventListener('click',function(e){
        if(moved)return;
        var id=this.dataset.id;
        tlSelected=tlSelected===id?null:id;
        renderTimeline();
      });
    });
    // Period filters
    root.querySelectorAll('.tl-period-btn').forEach(function(b){
      b.addEventListener('click',function(){
        tlPeriod=this.dataset.period;
        tlSelected=null;
        renderTimeline();
      });
    });
    // Clear button
    var clearBtn=root.querySelector('#tl-clear');
    if(clearBtn){clearBtn.addEventListener('click',function(){tlSelected=null;renderTimeline();});}
  }

  renderTimeline();
}
