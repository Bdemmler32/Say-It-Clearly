// Say It — Phrase Database
// Source: user-provided Vocabulary_Phrase_Test_250_No_Repetition.xlsx
// Each phrase has: id, text, difficulty (easy|medium|hard), focus (the
// challenge vocabulary words/phrases embedded in the sentence, comma-separated).
// This file is intentionally separate from the game logic so it can be edited,
// extended, or swapped out without touching app.js.

const PHRASES = [
  {
    "id": "e001",
    "text": "A brisk breeze scattered fragile petals across the narrow courtyard.",
    "difficulty": "easy",
    "focus": "brisk, fragile, scattered"
  },
  {
    "id": "e002",
    "text": "Her cheerful greeting eased the awkward silence in the crowded lobby.",
    "difficulty": "easy",
    "focus": "cheerful, awkward, crowded"
  },
  {
    "id": "e003",
    "text": "The curious child examined the peculiar shell with careful attention.",
    "difficulty": "easy",
    "focus": "curious, peculiar, examined"
  },
  {
    "id": "e004",
    "text": "A sudden drizzle dampened the dusty trail before our afternoon hike.",
    "difficulty": "easy",
    "focus": "drizzle, dampened, dusty"
  },
  {
    "id": "e005",
    "text": "Their generous neighbor delivered a hearty casserole during the storm.",
    "difficulty": "easy",
    "focus": "generous, hearty, casserole"
  },
  {
    "id": "e006",
    "text": "The weary traveler rested beside a shallow stream beneath towering pines.",
    "difficulty": "easy",
    "focus": "weary, shallow, towering"
  },
  {
    "id": "e007",
    "text": "Bright lanterns illuminated the winding path through the quiet garden.",
    "difficulty": "easy",
    "focus": "illuminated, winding, lanterns"
  },
  {
    "id": "e008",
    "text": "Our cautious guide avoided the slippery rocks near the rushing waterfall.",
    "difficulty": "easy",
    "focus": "cautious, slippery, rushing"
  },
  {
    "id": "e009",
    "text": "The playful puppy darted beneath the sturdy bench chasing a fluttering leaf.",
    "difficulty": "easy",
    "focus": "darted, sturdy, fluttering"
  },
  {
    "id": "e010",
    "text": "A distant whistle echoed through the vacant station after midnight.",
    "difficulty": "easy",
    "focus": "distant, echoed, vacant"
  },
  {
    "id": "e011",
    "text": "The patient baker kneaded the sticky dough until it became smooth.",
    "difficulty": "easy",
    "focus": "patient, kneaded, sticky"
  },
  {
    "id": "e012",
    "text": "Several eager volunteers organized donated supplies inside the spacious gymnasium.",
    "difficulty": "easy",
    "focus": "eager, donated, spacious"
  },
  {
    "id": "e013",
    "text": "The tiny cabin offered a cozy refuge from the chilly evening air.",
    "difficulty": "easy",
    "focus": "cozy, refuge, chilly"
  },
  {
    "id": "e014",
    "text": "His puzzled expression revealed confusion about the complicated directions.",
    "difficulty": "easy",
    "focus": "puzzled, revealed, complicated"
  },
  {
    "id": "e015",
    "text": "A graceful swan glided across the calm pond beside blooming lilies.",
    "difficulty": "easy",
    "focus": "graceful, glided, blooming"
  },
  {
    "id": "e016",
    "text": "The noisy parade attracted an enormous crowd along the downtown avenue.",
    "difficulty": "easy",
    "focus": "attracted, enormous, avenue"
  },
  {
    "id": "e017",
    "text": "She gave a sincere apology after making a careless remark.",
    "difficulty": "easy",
    "focus": "sincere, apology, careless"
  },
  {
    "id": "e018",
    "text": "Fresh herbs added a pleasant aroma to the simmering soup.",
    "difficulty": "easy",
    "focus": "pleasant, aroma, simmering"
  },
  {
    "id": "e019",
    "text": "The mechanic inspected the damaged engine before suggesting a simple repair.",
    "difficulty": "easy",
    "focus": "inspected, damaged, repair"
  },
  {
    "id": "e020",
    "text": "A narrow bridge crossed the muddy creek near the abandoned mill.",
    "difficulty": "easy",
    "focus": "narrow, muddy, abandoned"
  },
  {
    "id": "e021",
    "text": "His vivid description made the ordinary landscape seem surprisingly dramatic.",
    "difficulty": "easy",
    "focus": "vivid, ordinary, dramatic"
  },
  {
    "id": "e022",
    "text": "The toddler became restless during the lengthy ceremony in the chapel.",
    "difficulty": "easy",
    "focus": "restless, lengthy, ceremony"
  },
  {
    "id": "e023",
    "text": "A sturdy fence protected the vegetable garden from wandering deer.",
    "difficulty": "easy",
    "focus": "protected, wandering, vegetable"
  },
  {
    "id": "e024",
    "text": "The sudden announcement caused noticeable excitement throughout the busy office.",
    "difficulty": "easy",
    "focus": "announcement, noticeable, excitement"
  },
  {
    "id": "e025",
    "text": "Their modest cottage overlooked a peaceful valley dotted with farms.",
    "difficulty": "easy",
    "focus": "modest, overlooked, peaceful"
  },
  {
    "id": "e026",
    "text": "The energetic coach encouraged every hesitant player during practice.",
    "difficulty": "easy",
    "focus": "energetic, encouraged, hesitant"
  },
  {
    "id": "e027",
    "text": "A mysterious package arrived without a return address or explanation.",
    "difficulty": "easy",
    "focus": "mysterious, package, explanation"
  },
  {
    "id": "e028",
    "text": "She carefully folded the delicate fabric before placing it in storage.",
    "difficulty": "easy",
    "focus": "delicate, fabric, storage"
  },
  {
    "id": "e029",
    "text": "The crowded marketplace offered colorful produce and fragrant spices.",
    "difficulty": "easy",
    "focus": "marketplace, produce, fragrant"
  },
  {
    "id": "e030",
    "text": "His stubborn refusal created unnecessary tension during the family discussion.",
    "difficulty": "easy",
    "focus": "stubborn, refusal, tension"
  },
  {
    "id": "e031",
    "text": "A cheerful melody drifted from the nearby caf\u00e9 onto the sidewalk.",
    "difficulty": "easy",
    "focus": "melody, drifted, nearby"
  },
  {
    "id": "e032",
    "text": "The exhausted hikers discovered a sheltered clearing before sunset.",
    "difficulty": "easy",
    "focus": "exhausted, sheltered, clearing"
  },
  {
    "id": "e033",
    "text": "Her thoughtful gesture transformed an unpleasant morning into a memorable one.",
    "difficulty": "easy",
    "focus": "thoughtful, transformed, memorable"
  },
  {
    "id": "e034",
    "text": "A gentle current carried fallen branches toward the rocky shoreline.",
    "difficulty": "easy",
    "focus": "current, carried, shoreline"
  },
  {
    "id": "e035",
    "text": "The ancient staircase creaked beneath our cautious footsteps.",
    "difficulty": "easy",
    "focus": "ancient, creaked, footsteps"
  },
  {
    "id": "e036",
    "text": "Their lively conversation continued despite the frequent interruptions.",
    "difficulty": "easy",
    "focus": "lively, frequent, interruptions"
  },
  {
    "id": "e037",
    "text": "The clever fox disappeared into the dense undergrowth without a sound.",
    "difficulty": "easy",
    "focus": "clever, dense, undergrowth"
  },
  {
    "id": "e038",
    "text": "A portable heater kept the drafty workshop comfortable all winter.",
    "difficulty": "easy",
    "focus": "portable, drafty, workshop"
  },
  {
    "id": "e039",
    "text": "The instructor demonstrated the proper technique using familiar equipment.",
    "difficulty": "easy",
    "focus": "demonstrated, proper, technique"
  },
  {
    "id": "e040",
    "text": "Her calm response prevented a minor disagreement from becoming serious.",
    "difficulty": "easy",
    "focus": "prevented, minor, disagreement"
  },
  {
    "id": "e041",
    "text": "The glossy brochure featured scenic villages and inviting beaches.",
    "difficulty": "easy",
    "focus": "glossy, featured, scenic"
  },
  {
    "id": "e042",
    "text": "A gentle reminder helped everyone remember the revised schedule.",
    "difficulty": "easy",
    "focus": "reminder, revised, schedule"
  },
  {
    "id": "e043",
    "text": "The old warehouse contained dusty crates and forgotten machinery.",
    "difficulty": "easy",
    "focus": "warehouse, crates, machinery"
  },
  {
    "id": "e044",
    "text": "Their reliable service earned praise from several satisfied customers.",
    "difficulty": "easy",
    "focus": "reliable, praise, satisfied"
  },
  {
    "id": "e045",
    "text": "A crooked sign pointed toward the hidden entrance behind the theater.",
    "difficulty": "easy",
    "focus": "crooked, hidden, entrance"
  },
  {
    "id": "e046",
    "text": "The fragrant orchard enticed buzzing insects on the warm afternoon.",
    "difficulty": "easy",
    "focus": "orchard, enticed, buzzing"
  },
  {
    "id": "e047",
    "text": "His nervous laughter betrayed his uncertainty about the unexpected question.",
    "difficulty": "easy",
    "focus": "betrayed, uncertainty, unexpected"
  },
  {
    "id": "e048",
    "text": "The rough pavement made the bicycle ride unusually uncomfortable.",
    "difficulty": "easy",
    "focus": "rough, pavement, unusually"
  },
  {
    "id": "e049",
    "text": "A colorful mural brightened the neglected wall beside the playground.",
    "difficulty": "easy",
    "focus": "mural, brightened, neglected"
  },
  {
    "id": "e050",
    "text": "The sturdy bookshelf supported several heavy volumes without bending.",
    "difficulty": "easy",
    "focus": "bookshelf, supported, volumes"
  },
  {
    "id": "e051",
    "text": "Her polite request received an immediate and favorable response.",
    "difficulty": "easy",
    "focus": "polite, immediate, favorable"
  },
  {
    "id": "e052",
    "text": "A sudden gust toppled the lightweight chairs on the patio.",
    "difficulty": "easy",
    "focus": "gust, toppled, lightweight"
  },
  {
    "id": "e053",
    "text": "The sleepy village awakened to the rhythmic tolling of church bells.",
    "difficulty": "easy",
    "focus": "awakened, rhythmic, tolling"
  },
  {
    "id": "e054",
    "text": "His practical solution resolved the recurring problem with minimal effort.",
    "difficulty": "easy",
    "focus": "practical, resolved, recurring"
  },
  {
    "id": "e055",
    "text": "A cheerful receptionist greeted visitors in the renovated waiting area.",
    "difficulty": "easy",
    "focus": "receptionist, greeted, renovated"
  },
  {
    "id": "e056",
    "text": "The low-roofed cave provided temporary shelter from the heavy rain.",
    "difficulty": "easy",
    "focus": "temporary, shelter, low-roofed"
  },
  {
    "id": "e057",
    "text": "Their playful banter made the tedious journey feel much shorter.",
    "difficulty": "easy",
    "focus": "banter, tedious, journey"
  },
  {
    "id": "e058",
    "text": "The young musician practiced diligently before the important recital.",
    "difficulty": "easy",
    "focus": "diligently, recital, musician"
  },
  {
    "id": "e059",
    "text": "A faint glow appeared above the distant horizon just before sunrise.",
    "difficulty": "easy",
    "focus": "faint, horizon, sunrise"
  },
  {
    "id": "e060",
    "text": "The careful carpenter measured each wooden panel before installation.",
    "difficulty": "easy",
    "focus": "carpenter, panel, installation"
  },
  {
    "id": "e061",
    "text": "Her confident explanation reassured the anxious group of travelers.",
    "difficulty": "easy",
    "focus": "confident, reassured, anxious"
  },
  {
    "id": "e062",
    "text": "A rusty gate concealed a narrow passage into the courtyard.",
    "difficulty": "easy",
    "focus": "rusty, concealed, passage"
  },
  {
    "id": "e063",
    "text": "The refreshing breeze cooled the crowded pavilion during the observance.",
    "difficulty": "easy",
    "focus": "refreshing, pavilion, observance"
  },
  {
    "id": "e064",
    "text": "His humorous comment relieved the uncomfortable tension in the room.",
    "difficulty": "easy",
    "focus": "humorous, relieved, uncomfortable"
  },
  {
    "id": "e065",
    "text": "A sudden detour delayed our arrival at the remote campground.",
    "difficulty": "easy",
    "focus": "detour, delayed, remote"
  },
  {
    "id": "e066",
    "text": "The elderly gardener trimmed the overgrown hedge with remarkable patience.",
    "difficulty": "easy",
    "focus": "elderly, overgrown, remarkable"
  },
  {
    "id": "e067",
    "text": "Her neat handwriting filled the margins of the worn notebook.",
    "difficulty": "easy",
    "focus": "handwriting, margins, worn"
  },
  {
    "id": "e068",
    "text": "The friendly cashier handled the complicated return without complaint.",
    "difficulty": "easy",
    "focus": "cashier, handled, complaint"
  },
  {
    "id": "e069",
    "text": "A steep hillside overlooked the sparkling reservoir below.",
    "difficulty": "easy",
    "focus": "steep, sparkling, reservoir"
  },
  {
    "id": "e070",
    "text": "The warm blanket provided welcome comfort during the frosty night.",
    "difficulty": "easy",
    "focus": "provided, comfort, frosty"
  },
  {
    "id": "e071",
    "text": "His thoughtful question prompted a meaningful classroom discussion.",
    "difficulty": "easy",
    "focus": "prompted, meaningful, discussion"
  },
  {
    "id": "e072",
    "text": "A broken shutter rattled against the window during the windy evening.",
    "difficulty": "easy",
    "focus": "shutter, rattled, windy"
  },
  {
    "id": "e073",
    "text": "The cheerful choir performed a familiar hymn with impressive harmony.",
    "difficulty": "easy",
    "focus": "choir, hymn, harmony"
  },
  {
    "id": "e074",
    "text": "Our attentive server recommended a savory dish from the seasonal menu.",
    "difficulty": "easy",
    "focus": "attentive, savory, seasonal"
  },
  {
    "id": "e075",
    "text": "The quiet librarian located the missing volume on a crowded shelf.",
    "difficulty": "easy",
    "focus": "librarian, located, missing"
  },
  {
    "id": "m001",
    "text": "The meticulous curator cataloged the obscure artifacts before the gallery reopened.",
    "difficulty": "medium",
    "focus": "meticulous, curator, cataloged, obscure"
  },
  {
    "id": "m002",
    "text": "A persistent drought depleted the reservoir and jeopardized nearby harvests.",
    "difficulty": "medium",
    "focus": "persistent, depleted, jeopardized, harvests"
  },
  {
    "id": "m003",
    "text": "Her diplomatic response defused a contentious debate among the committee members.",
    "difficulty": "medium",
    "focus": "diplomatic, defused, contentious, committee"
  },
  {
    "id": "m004",
    "text": "The resilient community restored several historic buildings after the devastating flood.",
    "difficulty": "medium",
    "focus": "resilient, restored, historic, devastating"
  },
  {
    "id": "m005",
    "text": "An elaborate mosaic adorned the vestibule of the newly renovated museum.",
    "difficulty": "medium",
    "focus": "elaborate, mosaic, adorned, vestibule"
  },
  {
    "id": "m006",
    "text": "The skeptical journalist scrutinized the ambiguous statement before publishing her article.",
    "difficulty": "medium",
    "focus": "skeptical, scrutinized, ambiguous, publishing"
  },
  {
    "id": "m007",
    "text": "A formidable ridge separated the remote settlement from the fertile valley.",
    "difficulty": "medium",
    "focus": "formidable, ridge, settlement, fertile"
  },
  {
    "id": "m008",
    "text": "His spontaneous proposal generated considerable enthusiasm among the prospective volunteers.",
    "difficulty": "medium",
    "focus": "spontaneous, generated, considerable, prospective"
  },
  {
    "id": "m009",
    "text": "The tranquil sanctuary provided respite from the relentless noise of downtown.",
    "difficulty": "medium",
    "focus": "tranquil, sanctuary, respite, relentless"
  },
  {
    "id": "m010",
    "text": "Their innovative prototype demonstrated noteworthy efficiency under demanding conditions.",
    "difficulty": "medium",
    "focus": "innovative, prototype, noteworthy, efficiency"
  },
  {
    "id": "m011",
    "text": "A subtle fragrance permeated the conservatory as exotic flowers began blooming.",
    "difficulty": "medium",
    "focus": "subtle, permeated, conservatory, exotic"
  },
  {
    "id": "m012",
    "text": "The reluctant witness offered a fragmented account of the bewildering incident.",
    "difficulty": "medium",
    "focus": "reluctant, fragmented, bewildering, incident"
  },
  {
    "id": "m013",
    "text": "Her eloquent remarks conveyed genuine gratitude without becoming overly sentimental.",
    "difficulty": "medium",
    "focus": "eloquent, conveyed, genuine, sentimental"
  },
  {
    "id": "m014",
    "text": "The deteriorating fa\u00e7ade required extensive restoration before the building could reopen.",
    "difficulty": "medium",
    "focus": "deteriorating, fa\u00e7ade, extensive, restoration"
  },
  {
    "id": "m015",
    "text": "An unexpected shortage spurred merchants to ration several essential commodities.",
    "difficulty": "medium",
    "focus": "shortage, spurred, ration, commodities"
  },
  {
    "id": "m016",
    "text": "The vigorous debate exposed fundamental differences in the competing proposals.",
    "difficulty": "medium",
    "focus": "vigorous, exposed, fundamental, competing"
  },
  {
    "id": "m017",
    "text": "A secluded alcove offered privacy within the otherwise bustling terminal.",
    "difficulty": "medium",
    "focus": "secluded, alcove, privacy, bustling"
  },
  {
    "id": "m018",
    "text": "His unconventional strategy yielded impressive results despite initial skepticism.",
    "difficulty": "medium",
    "focus": "unconventional, yielded, impressive, skepticism"
  },
  {
    "id": "m019",
    "text": "The somber procession moved slowly through the narrow boulevard at dusk.",
    "difficulty": "medium",
    "focus": "somber, procession, boulevard, dusk"
  },
  {
    "id": "m020",
    "text": "Their comprehensive survey revealed substantial disparities between rural and urban services.",
    "difficulty": "medium",
    "focus": "comprehensive, substantial, disparities, rural"
  },
  {
    "id": "m021",
    "text": "A seasoned negotiator mediated the dispute before hostility could escalate.",
    "difficulty": "medium",
    "focus": "seasoned, mediated, hostility, escalate"
  },
  {
    "id": "m022",
    "text": "The intricate mechanism required precise calibration after prolonged use.",
    "difficulty": "medium",
    "focus": "intricate, mechanism, precise, calibration"
  },
  {
    "id": "m023",
    "text": "Her restrained reaction screened considerable frustration with the arbitrary decision.",
    "difficulty": "medium",
    "focus": "restrained, screened, frustration, arbitrary"
  },
  {
    "id": "m024",
    "text": "The picturesque harbor became increasingly congested during the annual maritime festival.",
    "difficulty": "medium",
    "focus": "picturesque, congested, annual, maritime"
  },
  {
    "id": "m025",
    "text": "An attentive physician noticed incipient symptoms that had previously been dismissed.",
    "difficulty": "medium",
    "focus": "physician, incipient, symptoms, dismissed"
  },
  {
    "id": "m026",
    "text": "The newly discovered manuscript contained cryptic annotations along several page borders.",
    "difficulty": "medium",
    "focus": "manuscript, cryptic, annotations, page borders"
  },
  {
    "id": "m027",
    "text": "His prudent investment preserved capital during a period of economic volatility.",
    "difficulty": "medium",
    "focus": "prudent, preserved, capital, volatility"
  },
  {
    "id": "m028",
    "text": "A dense canopy obscured the trail and involved our navigation.",
    "difficulty": "medium",
    "focus": "canopy, obscured, involved, navigation"
  },
  {
    "id": "m029",
    "text": "The charismatic speaker captivated the audience with a compelling anecdote.",
    "difficulty": "medium",
    "focus": "charismatic, captivated, compelling, anecdote"
  },
  {
    "id": "m030",
    "text": "Their preliminary findings contradicted several widely accepted assumptions.",
    "difficulty": "medium",
    "focus": "preliminary, findings, contradicted, assumptions"
  },
  {
    "id": "m031",
    "text": "A cumbersome procedure delayed approval of the urgently needed equipment.",
    "difficulty": "medium",
    "focus": "cumbersome, procedure, approval, urgently"
  },
  {
    "id": "m032",
    "text": "The ornate chandelier lit a grand staircase lined with portraits.",
    "difficulty": "medium",
    "focus": "ornate, chandelier, lit, portraits"
  },
  {
    "id": "m033",
    "text": "Her candid assessment highlighted both promising opportunities and lingering vulnerabilities.",
    "difficulty": "medium",
    "focus": "candid, assessment, promising, vulnerabilities"
  },
  {
    "id": "m034",
    "text": "The abandoned quarry gradually accumulated debris and stagnant water.",
    "difficulty": "medium",
    "focus": "quarry, accumulated, debris, stagnant"
  },
  {
    "id": "m035",
    "text": "A compelling documentary examined the ethical implications of emerging technology.",
    "difficulty": "medium",
    "focus": "documentary, ethical, implications, emerging"
  },
  {
    "id": "m036",
    "text": "The discerning chef balanced pungent spices with nuanced citrus notes.",
    "difficulty": "medium",
    "focus": "discerning, pungent, nuanced citrus, notes"
  },
  {
    "id": "m037",
    "text": "His erratic behavior intensified concern among colleagues who had noticed recent changes.",
    "difficulty": "medium",
    "focus": "erratic, intensified, concern, colleagues"
  },
  {
    "id": "m038",
    "text": "The regional council allocated additional resources to alleviate chronic congestion.",
    "difficulty": "medium",
    "focus": "allocated, alleviate, chronic, congestion"
  },
  {
    "id": "m039",
    "text": "A torrential downpour inundated several low-lying neighborhoods before dawn.",
    "difficulty": "medium",
    "focus": "torrential, inundated, low-lying, neighborhoods"
  },
  {
    "id": "m040",
    "text": "Her impeccable timing transfigured an ordinary presentation into an unforgettable performance.",
    "difficulty": "medium",
    "focus": "impeccable, transfigured, presentation, unforgettable"
  },
  {
    "id": "m041",
    "text": "The austere interior contrasted sharply with the building's decorative exterior.",
    "difficulty": "medium",
    "focus": "austere, contrasted, decorative, exterior"
  },
  {
    "id": "m042",
    "text": "An observant student identified a subtle discrepancy in the experimental results.",
    "difficulty": "medium",
    "focus": "observant, discrepancy, experimental, results"
  },
  {
    "id": "m043",
    "text": "The deteriorated roadway impeded emergency vehicles during the severe winter storm.",
    "difficulty": "medium",
    "focus": "deteriorated, impeded, emergency, severe"
  },
  {
    "id": "m044",
    "text": "His persuasive argument induced the board to reconsider its tentative decision.",
    "difficulty": "medium",
    "focus": "persuasive, induced, reconsider, tentative"
  },
  {
    "id": "m045",
    "text": "A painstaking restoration preserved the cathedral's distinctive architectural features.",
    "difficulty": "medium",
    "focus": "painstaking, cathedral, distinctive, architectural"
  },
  {
    "id": "m046",
    "text": "The prolonged outage disrupted routine operations throughout the municipal complex.",
    "difficulty": "medium",
    "focus": "prolonged, disrupted, routine, municipal"
  },
  {
    "id": "m047",
    "text": "Her perceptive questions uncovered inconsistencies in the otherwise plausible explanation.",
    "difficulty": "medium",
    "focus": "perceptive, uncovered, inconsistencies, plausible"
  },
  {
    "id": "m048",
    "text": "The rugged coastline presented daunting obstacles to early explorers.",
    "difficulty": "medium",
    "focus": "rugged, coastline, daunting, obstacles"
  },
  {
    "id": "m049",
    "text": "A dormant volcano dominated the landscape beyond the cultivated terraces.",
    "difficulty": "medium",
    "focus": "dormant, dominated, cultivated, terraces"
  },
  {
    "id": "m050",
    "text": "His reserved demeanor softened during the convivial evening gathering.",
    "difficulty": "medium",
    "focus": "reserved, demeanor, convivial, gathering"
  },
  {
    "id": "m051",
    "text": "The fragile truce remained intact despite provocative remarks from both factions.",
    "difficulty": "medium",
    "focus": "truce, intact, provocative, factions"
  },
  {
    "id": "m052",
    "text": "An ambitious renovation converted the derelict factory into affordable housing.",
    "difficulty": "medium",
    "focus": "ambitious, converted, derelict, affordable"
  },
  {
    "id": "m053",
    "text": "The vigilant ranger detected faint smoke beyond the isolated crest.",
    "difficulty": "medium",
    "focus": "vigilant, detected, isolated, crest"
  },
  {
    "id": "m054",
    "text": "Her nuanced interpretation challenged the conventional reading of the historical document.",
    "difficulty": "medium",
    "focus": "nuanced, interpretation, conventional, historical"
  },
  {
    "id": "m055",
    "text": "A recurring malfunction compromised the reliability of the laboratory equipment.",
    "difficulty": "medium",
    "focus": "malfunction, compromised, reliability, laboratory"
  },
  {
    "id": "m056",
    "text": "The bustling promenade featured eclectic vendors, musicians, and street performers.",
    "difficulty": "medium",
    "focus": "promenade, eclectic, vendors, performers"
  },
  {
    "id": "m057",
    "text": "His concise summary clarified a thorny issue without oversimplifying it.",
    "difficulty": "medium",
    "focus": "concise, clarified, thorny, oversimplifying"
  },
  {
    "id": "m058",
    "text": "The arid terrain supported only sparse vegetation and hardy shrubs.",
    "difficulty": "medium",
    "focus": "arid, terrain, sparse, hardy"
  },
  {
    "id": "m059",
    "text": "A discreet inquiry revealed widespread dissatisfaction with the revised policy.",
    "difficulty": "medium",
    "focus": "discreet, inquiry, widespread, dissatisfaction"
  },
  {
    "id": "m060",
    "text": "Her unwavering commitment sustained the initiative through several difficult setbacks.",
    "difficulty": "medium",
    "focus": "unwavering, sustained, initiative, setbacks"
  },
  {
    "id": "m061",
    "text": "The antiquated plumbing caused intermittent leaks throughout the aging residence.",
    "difficulty": "medium",
    "focus": "antiquated, intermittent, aging, residence"
  },
  {
    "id": "m062",
    "text": "An impartial mediator proposed a workable compromise after hours of negotiation.",
    "difficulty": "medium",
    "focus": "impartial, mediator, workable, compromise"
  },
  {
    "id": "m063",
    "text": "The expansive meadow was dotted with grazing livestock and wildflowers.",
    "difficulty": "medium",
    "focus": "expansive, meadow, grazing, livestock"
  },
  {
    "id": "m064",
    "text": "His cautious optimism reflected encouraging data alongside unresolved concerns.",
    "difficulty": "medium",
    "focus": "optimism, encouraging, unresolved, concerns"
  },
  {
    "id": "m065",
    "text": "A prominent scholar delivered an inflammatory lecture on cultural assimilation.",
    "difficulty": "medium",
    "focus": "prominent, inflammatory, cultural, assimilation"
  },
  {
    "id": "m066",
    "text": "The narrow corridor amplified every footstep in the cavernous building.",
    "difficulty": "medium",
    "focus": "corridor, amplified, cavernous, building"
  },
  {
    "id": "m067",
    "text": "Her resourceful improvisation prevented the expedition from being forsaken.",
    "difficulty": "medium",
    "focus": "resourceful, improvisation, expedition, forsaken"
  },
  {
    "id": "m068",
    "text": "The deteriorating pier posed a significant hazard to recreational boaters.",
    "difficulty": "medium",
    "focus": "pier, significant, hazard, recreational"
  },
  {
    "id": "m069",
    "text": "A perceptible tremor rattled windows throughout the densely populated district.",
    "difficulty": "medium",
    "focus": "perceptible, tremor, densely, district"
  },
  {
    "id": "m070",
    "text": "His courteous demeanor masked a firm objection to the proposed arrangement.",
    "difficulty": "medium",
    "focus": "courteous, masked, objection, arrangement"
  },
  {
    "id": "m071",
    "text": "The innovative curriculum emphasizes practical applications alongside theoretical concepts.",
    "difficulty": "medium",
    "focus": "curriculum, emphasizes, applications, theoretical"
  },
  {
    "id": "m072",
    "text": "An inconspicuous doorway led to a surprisingly commodious underground chamber.",
    "difficulty": "medium",
    "focus": "inconspicuous, commodious, underground, chamber"
  },
  {
    "id": "m073",
    "text": "The vigorous campaign mobilized residents around several urgent civic priorities.",
    "difficulty": "medium",
    "focus": "campaign, mobilized, civic, priorities"
  },
  {
    "id": "m074",
    "text": "Her coherent explanation reconciled two seemingly contradictory accounts.",
    "difficulty": "medium",
    "focus": "coherent, reconciled, seemingly, contradictory"
  },
  {
    "id": "m075",
    "text": "The pristine shoreline remained largely untouched by commercial development.",
    "difficulty": "medium",
    "focus": "pristine, untouched, commercial, development"
  },
  {
    "id": "m076",
    "text": "A shrewd entrepreneur identified an untapped opportunity in the changing market.",
    "difficulty": "medium",
    "focus": "shrewd, entrepreneur, untapped, market"
  },
  {
    "id": "m077",
    "text": "His apprehensive tone suggested reservations about the accelerated timetable.",
    "difficulty": "medium",
    "focus": "apprehensive, reservations, accelerated, timetable"
  },
  {
    "id": "m078",
    "text": "The ceremonial procession culminated in a solemn dedication at the monument.",
    "difficulty": "medium",
    "focus": "ceremonial, culminated, solemn, dedication"
  },
  {
    "id": "m079",
    "text": "An extensive archive documented decades of correspondence and institutional history.",
    "difficulty": "medium",
    "focus": "archive, documented, correspondence, institutional"
  },
  {
    "id": "m080",
    "text": "The volatile mixture required careful handling under controlled laboratory conditions.",
    "difficulty": "medium",
    "focus": "volatile, mixture, controlled, conditions"
  },
  {
    "id": "m081",
    "text": "Her persuasive testimony strengthened the case for thoroughgoing reform.",
    "difficulty": "medium",
    "focus": "testimony, strengthened, thoroughgoing, reform"
  },
  {
    "id": "m082",
    "text": "The remote monastery conserved rare manuscripts in a climate-controlled vault.",
    "difficulty": "medium",
    "focus": "monastery, conserved, rare, vault"
  },
  {
    "id": "m083",
    "text": "A severe bottleneck developed when construction narrowed the principal thoroughfare.",
    "difficulty": "medium",
    "focus": "bottleneck, narrowed, principal, thoroughfare"
  },
  {
    "id": "m084",
    "text": "His understated humor provided welcome relief during the tense proceedings.",
    "difficulty": "medium",
    "focus": "understated, relief, tense, proceedings"
  },
  {
    "id": "m085",
    "text": "The thriving ecosystem depended on a delicate balance of cyclical rainfall.",
    "difficulty": "medium",
    "focus": "thriving, ecosystem, depended, cyclical"
  },
  {
    "id": "m086",
    "text": "An abrupt resignation triggered speculation about internal disagreements within the organization.",
    "difficulty": "medium",
    "focus": "abrupt, resignation, speculation, internal"
  },
  {
    "id": "m087",
    "text": "The redoubtable manuscript demanded extended concentration from even experienced readers.",
    "difficulty": "medium",
    "focus": "redoubtable, demanded, extended, experienced"
  },
  {
    "id": "m088",
    "text": "Her pragmatic approach prioritized feasible improvements over grandiose promises.",
    "difficulty": "medium",
    "focus": "pragmatic, prioritized, feasible, grandiose"
  },
  {
    "id": "m089",
    "text": "The untended orchard gradually became entangled with invasive vines and brush.",
    "difficulty": "medium",
    "focus": "untended, entangled, invasive, brush"
  },
  {
    "id": "m090",
    "text": "A reputable contractor provided a detailed estimate for structural repairs.",
    "difficulty": "medium",
    "focus": "reputable, contractor, estimate, structural"
  },
  {
    "id": "m091",
    "text": "His fleeting hesitation signaled ambiguity during the otherwise confident interview.",
    "difficulty": "medium",
    "focus": "fleeting, hesitation, signaled, ambiguity"
  },
  {
    "id": "m092",
    "text": "The complex regulation imposed stringent requirements on commercial operators.",
    "difficulty": "medium",
    "focus": "regulation, stringent, requirements, operators"
  },
  {
    "id": "m093",
    "text": "An accomplished artisan rehabilitated the damaged furniture using traditional techniques.",
    "difficulty": "medium",
    "focus": "artisan, rehabilitated, traditional, techniques"
  },
  {
    "id": "m094",
    "text": "The luminous display remade the dark plaza into a vibrant gathering place.",
    "difficulty": "medium",
    "focus": "luminous, remade, vibrant, plaza"
  },
  {
    "id": "m095",
    "text": "Her measured response acknowledged legitimate criticism without conceding the central point.",
    "difficulty": "medium",
    "focus": "measured, acknowledged, legitimate, conceding"
  },
  {
    "id": "m096",
    "text": "The sprawling estate included orchards, stables, and an ornamental pond.",
    "difficulty": "medium",
    "focus": "sprawling, estate, stables, ornamental"
  },
  {
    "id": "m097",
    "text": "A tenacious rumor undermined morale despite repeated official denials.",
    "difficulty": "medium",
    "focus": "tenacious, undermined, morale, denials"
  },
  {
    "id": "m098",
    "text": "His inventive solution repurposed discarded materials into functional furniture.",
    "difficulty": "medium",
    "focus": "inventive, repurposed, discarded, functional"
  },
  {
    "id": "m099",
    "text": "The crowded auditorium fell silent as the distinguished lecturer approached the podium.",
    "difficulty": "medium",
    "focus": "auditorium, distinguished, lecturer, podium"
  },
  {
    "id": "m100",
    "text": "An unforeseen complication forced the team to revise its original itinerary.",
    "difficulty": "medium",
    "focus": "unforeseen, complication, revise, itinerary"
  },
  {
    "id": "h001",
    "text": "The gradual deterioration of obsolete infrastructure necessitated substantial rehabilitation efforts.",
    "difficulty": "hard",
    "focus": "deterioration, obsolete, infrastructure, necessitated, rehabilitation"
  },
  {
    "id": "h002",
    "text": "The charcuterie board featured scrumptious delicacies that dazzled even fastidious critics.",
    "difficulty": "hard",
    "focus": "charcuterie, scrumptious, delicacies, dazzled, fastidious"
  },
  {
    "id": "h003",
    "text": "A parsimonious administrator curtailed discretionary expenditures despite vehement departmental objections.",
    "difficulty": "hard",
    "focus": "parsimonious, curtailed, discretionary, expenditures, vehement"
  },
  {
    "id": "h004",
    "text": "Her perspicacious analysis exposed latent contradictions within the ostensibly lucid proposal.",
    "difficulty": "hard",
    "focus": "perspicacious, latent, ostensibly, lucid, contradictions"
  },
  {
    "id": "h005",
    "text": "The recalcitrant committee resisted conciliatory measures and perpetuated the acrimonious dispute.",
    "difficulty": "hard",
    "focus": "recalcitrant, conciliatory, perpetuated, acrimonious, dispute"
  },
  {
    "id": "h006",
    "text": "An ephemeral alliance emerged from geopolitical expediency rather than ideological affinity.",
    "difficulty": "hard",
    "focus": "ephemeral, geopolitical, expediency, ideological, affinity"
  },
  {
    "id": "h007",
    "text": "His magnanimous concession defused rancor and facilitated an unexpectedly amicable settlement.",
    "difficulty": "hard",
    "focus": "magnanimous, concession, rancor, facilitated, amicable"
  },
  {
    "id": "h008",
    "text": "The labyrinthine regulations imposed onerous obligations on even scrupulous practitioners.",
    "difficulty": "hard",
    "focus": "labyrinthine, onerous, obligations, scrupulous, practitioners"
  },
  {
    "id": "h009",
    "text": "A cacophonous cort\u00e8ge shattered the otherwise placid atmosphere of the cloistered village.",
    "difficulty": "hard",
    "focus": "cacophonous, placid, cloistered, cort\u00e8ge, shattered"
  },
  {
    "id": "h010",
    "text": "Her trenchant critique dismantled several specious assumptions embedded in the prevailing doctrine.",
    "difficulty": "hard",
    "focus": "trenchant, dismantled, specious, prevailing, doctrine"
  },
  {
    "id": "h011",
    "text": "The dilapidated tenement required systemic remediation before habitation could be considered safe.",
    "difficulty": "hard",
    "focus": "dilapidated, tenement, remediation, habitation, systemic"
  },
  {
    "id": "h012",
    "text": "An assiduous archivist deciphered illegible marginalia scattered throughout the esoteric manuscript.",
    "difficulty": "hard",
    "focus": "assiduous, deciphered, illegible, marginalia, esoteric"
  },
  {
    "id": "h013",
    "text": "His equivocal testimony magnified conjecture about the clandestine accord.",
    "difficulty": "hard",
    "focus": "equivocal, magnified, conjecture, clandestine, accord"
  },
  {
    "id": "h014",
    "text": "The municipality implemented draconian restrictions to mitigate an unprecedented fiscal shortfall.",
    "difficulty": "hard",
    "focus": "municipality, draconian, mitigate, unprecedented, fiscal"
  },
  {
    "id": "h015",
    "text": "A sagacious mentor discouraged impulsive decisions and advocated deliberate reflection.",
    "difficulty": "hard",
    "focus": "sagacious, impulsive, advocated, deliberate, reflection"
  },
  {
    "id": "h016",
    "text": "The apparently benign amendment contained provisions with far-reaching jurisprudential consequences.",
    "difficulty": "hard",
    "focus": "apparently, benign, provisions, jurisprudential, consequences"
  },
  {
    "id": "h017",
    "text": "Her indefatigable advocacy galvanized apathetic residents around an increasingly urgent cause.",
    "difficulty": "hard",
    "focus": "indefatigable, advocacy, galvanized, apathetic, urgent"
  },
  {
    "id": "h018",
    "text": "The capricious weather rendered exacting logistical planning virtually futile.",
    "difficulty": "hard",
    "focus": "capricious, rendered, exacting, logistical, futile"
  },
  {
    "id": "h019",
    "text": "A surreptitious amendment circumvented customary scrutiny and provoked widespread indignation.",
    "difficulty": "hard",
    "focus": "surreptitious, circumvented, customary, scrutiny, indignation"
  },
  {
    "id": "h020",
    "text": "His mellifluous narration belied the harrowing circumstances described in the memoir.",
    "difficulty": "hard",
    "focus": "mellifluous, belied, harrowing, circumstances, memoir"
  },
  {
    "id": "h021",
    "text": "The antiquarian appraised the provenance of several putatively priceless relics.",
    "difficulty": "hard",
    "focus": "antiquarian, appraised, provenance, putatively, relics"
  },
  {
    "id": "h022",
    "text": "A pernicious rumor metastasized through the institution despite repeated repudiations.",
    "difficulty": "hard",
    "focus": "pernicious, metastasized, institution, repudiations, repeated"
  },
  {
    "id": "h023",
    "text": "Her punctilious adherence to protocol frustrated colleagues accustomed to expedient shortcuts.",
    "difficulty": "hard",
    "focus": "punctilious, adherence, protocol, expedient, shortcuts"
  },
  {
    "id": "h024",
    "text": "The desiccated landscape testified to years of relentless aridity and ecological attrition.",
    "difficulty": "hard",
    "focus": "desiccated, testified, aridity, ecological, attrition"
  },
  {
    "id": "h025",
    "text": "An iconoclastic scholar challenged entrenched orthodoxies with taxing empirical evidence.",
    "difficulty": "hard",
    "focus": "iconoclastic, entrenched, orthodoxies, taxing, empirical"
  },
  {
    "id": "h026",
    "text": "His obsequious bearing toward superiors starkly diverged from his brusque treatment of subordinates.",
    "difficulty": "hard",
    "focus": "obsequious, bearing, brusque, subordinates, diverged"
  },
  {
    "id": "h027",
    "text": "The convoluted litigation generated protracted uncertainty among creditors and beneficiaries.",
    "difficulty": "hard",
    "focus": "convoluted, litigation, protracted, creditors, beneficiaries"
  },
  {
    "id": "h028",
    "text": "A tacit understanding preserved a tenuous equilibrium between otherwise antagonistic blocs.",
    "difficulty": "hard",
    "focus": "tacit, tenuous, equilibrium, antagonistic, blocs"
  },
  {
    "id": "h029",
    "text": "Her erudite commentary elucidated arcane references that had perplexed casual readers.",
    "difficulty": "hard",
    "focus": "erudite, elucidated, arcane, perplexed, commentary"
  },
  {
    "id": "h030",
    "text": "The receding glacier exposed primordial strata containing remarkably unspoiled fossils.",
    "difficulty": "hard",
    "focus": "receding, primordial, strata, unspoiled, fossils"
  },
  {
    "id": "h031",
    "text": "An impecunious patron nevertheless commissioned an opulent mural through audacious borrowing.",
    "difficulty": "hard",
    "focus": "impecunious, commissioned, opulent, audacious, borrowing"
  },
  {
    "id": "h032",
    "text": "His sardonic rejoinder punctured the self-important rhetoric of the grandiloquent speaker.",
    "difficulty": "hard",
    "focus": "sardonic, rejoinder, punctured, rhetoric, grandiloquent"
  },
  {
    "id": "h033",
    "text": "The covert consortium manipulated commodity prices through coordinated speculative purchases.",
    "difficulty": "hard",
    "focus": "covert, consortium, manipulated, commodity, speculative"
  },
  {
    "id": "h034",
    "text": "A prodigious memory enabled the polyglot interpreter to navigate fine-grained exchanges in statecraft.",
    "difficulty": "hard",
    "focus": "prodigious, polyglot, interpreter, fine-grained, statecraft"
  },
  {
    "id": "h035",
    "text": "Her circumspect response avoided exacerbating an already unstable interpersonal conflict.",
    "difficulty": "hard",
    "focus": "circumspect, exacerbating, unstable, interpersonal, conflict"
  },
  {
    "id": "h036",
    "text": "The ossified bureaucracy proved impervious to incremental reforms proposed by junior staff.",
    "difficulty": "hard",
    "focus": "ossified, bureaucracy, impervious, incremental, reforms"
  },
  {
    "id": "h037",
    "text": "An anomalous reading persuaded investigators to recalibrate the sophisticated instrumentation.",
    "difficulty": "hard",
    "focus": "anomalous, persuaded, recalibrate, sophisticated, instrumentation"
  },
  {
    "id": "h038",
    "text": "His quixotic campaign pursued sweeping transformation despite negligible organizational support.",
    "difficulty": "hard",
    "focus": "quixotic, sweeping, negligible, organizational, support"
  },
  {
    "id": "h039",
    "text": "The sepulchral silence deepened the foreboding atmosphere within the subterranean compartment.",
    "difficulty": "hard",
    "focus": "sepulchral, foreboding, subterranean, compartment, deepened"
  },
  {
    "id": "h040",
    "text": "A mendacious witness offered inconsistent assertions that ultimately eroded her credibility.",
    "difficulty": "hard",
    "focus": "mendacious, assertions, eroded, credibility, inconsistent"
  },
  {
    "id": "h041",
    "text": "Her cogent synthesis harmonized disparate findings from several ostensibly incompatible studies.",
    "difficulty": "hard",
    "focus": "cogent, synthesis, harmonized, disparate, incompatible"
  },
  {
    "id": "h042",
    "text": "The mercurial director alternated between effusive praise and caustic reprimands.",
    "difficulty": "hard",
    "focus": "mercurial, effusive, caustic, reprimands, alternated"
  },
  {
    "id": "h043",
    "text": "An inchoate movement coalesced around diffuse grievances and magnetic leadership.",
    "difficulty": "hard",
    "focus": "inchoate, coalesced, diffuse, grievances, magnetic"
  },
  {
    "id": "h044",
    "text": "His discriminating preparation minimized foreseeable complications during the multifaceted intervention.",
    "difficulty": "hard",
    "focus": "discriminating, minimized, foreseeable, multifaceted, intervention"
  },
  {
    "id": "h045",
    "text": "The palatial residence hid spartan private quarters behind an ostentatious frontage.",
    "difficulty": "hard",
    "focus": "palatial, spartan, ostentatious, frontage, hid"
  },
  {
    "id": "h046",
    "text": "A querulous customer overwhelmed the staff with incessant complaints about trivial inconveniences.",
    "difficulty": "hard",
    "focus": "querulous, overwhelmed, incessant, trivial, inconveniences"
  },
  {
    "id": "h047",
    "text": "Her sanguine forecast seemed incongruous amid declining economic indicators.",
    "difficulty": "hard",
    "focus": "sanguine, forecast, incongruous, declining, indicators"
  },
  {
    "id": "h048",
    "text": "The immutable deadline compelled rapid triage of competing and increasingly exigent imperatives.",
    "difficulty": "hard",
    "focus": "immutable, compelled, triage, exigent, imperatives"
  },
  {
    "id": "h049",
    "text": "An unctuous emissary delivered flattering assurances while pursuing ulterior objectives.",
    "difficulty": "hard",
    "focus": "unctuous, emissary, assurances, ulterior, objectives"
  },
  {
    "id": "h050",
    "text": "His laconic reply conveyed unmistakable disapproval without explicit condemnation.",
    "difficulty": "hard",
    "focus": "laconic, unmistakable, disapproval, explicit, condemnation"
  },
  {
    "id": "h051",
    "text": "The Byzantine approval process engendered frustration, redundancy, and administrative paralysis.",
    "difficulty": "hard",
    "focus": "Byzantine, engendered, redundancy, administrative, paralysis"
  },
  {
    "id": "h052",
    "text": "A deleterious contaminant infiltrated the aquifer and imperiled downstream communities.",
    "difficulty": "hard",
    "focus": "deleterious, contaminant, infiltrated, aquifer, imperiled"
  },
  {
    "id": "h053",
    "text": "Her iconographic analysis revealed syncretic influences within the ritual artwork.",
    "difficulty": "hard",
    "focus": "iconographic, syncretic, influences, ritual, artwork"
  },
  {
    "id": "h054",
    "text": "The fractious coalition splintered after irreconcilable disagreements over fiscal austerity.",
    "difficulty": "hard",
    "focus": "fractious, coalition, splintered, irreconcilable, austerity"
  },
  {
    "id": "h055",
    "text": "An avuncular professor tempered rigorous criticism with disarming warmth and wit.",
    "difficulty": "hard",
    "focus": "avuncular, tempered, rigorous, disarming, wit"
  },
  {
    "id": "h056",
    "text": "His perfunctory apology only exacerbated resentment among those seeking authentic contrition.",
    "difficulty": "hard",
    "focus": "perfunctory, exacerbated, resentment, authentic, contrition"
  },
  {
    "id": "h057",
    "text": "The nascent enterprise survived precarious financing through frugality and entrepreneurial ingenuity.",
    "difficulty": "hard",
    "focus": "nascent, precarious, frugality, entrepreneurial, ingenuity"
  },
  {
    "id": "h058",
    "text": "A protean performer moved effortlessly between tragic gravitas and irreverent comedy.",
    "difficulty": "hard",
    "focus": "protean, effortlessly, gravitas, irreverent, comedy"
  },
  {
    "id": "h059",
    "text": "Her oblique reference alluded to a scandal that remained officially unacknowledged.",
    "difficulty": "hard",
    "focus": "oblique, alluded, scandal, officially, unacknowledged"
  },
  {
    "id": "h060",
    "text": "The verdant escarpment concealed treacherous ravines beneath luxuriant vegetation.",
    "difficulty": "hard",
    "focus": "verdant, escarpment, treacherous, ravines, luxuriant"
  },
  {
    "id": "h061",
    "text": "An inveterate skeptic dismissed anecdotal claims and demanded reproducible evidence.",
    "difficulty": "hard",
    "focus": "inveterate, skeptic, anecdotal, reproducible, evidence"
  },
  {
    "id": "h062",
    "text": "His florid prose veiled a relatively mundane argument beneath excessive ornamentation.",
    "difficulty": "hard",
    "focus": "florid, veiled, mundane, excessive, ornamentation"
  },
  {
    "id": "h063",
    "text": "The attenuated signal produced sporadic artifacts that confounded precise reading.",
    "difficulty": "hard",
    "focus": "attenuated, sporadic, artifacts, confounded, reading"
  },
  {
    "id": "h064",
    "text": "A bellicose faction rejected rapprochement and urged retaliatory measures.",
    "difficulty": "hard",
    "focus": "bellicose, rapprochement, urged, retaliatory, measures"
  },
  {
    "id": "h065",
    "text": "Her limpid explanation transmuted an abstruse concept into something unexpectedly intelligible.",
    "difficulty": "hard",
    "focus": "limpid, transmuted, abstruse, intelligible, unexpectedly"
  },
  {
    "id": "h066",
    "text": "The antiquated apparatus emitted noxious fumes despite painstakingly precise maintenance.",
    "difficulty": "hard",
    "focus": "apparatus, noxious, emitted, painstakingly precise, maintenance"
  },
  {
    "id": "h067",
    "text": "An impecunious aristocrat liquidated ancestral holdings to satisfy mounting liabilities.",
    "difficulty": "hard",
    "focus": "aristocrat, liquidated, ancestral, liabilities, mounting"
  },
  {
    "id": "h068",
    "text": "His supercilious manner alienated collaborators who resented gratuitous condescension.",
    "difficulty": "hard",
    "focus": "supercilious, alienated, collaborators, gratuitous, condescension"
  },
  {
    "id": "h069",
    "text": "The propitious weather enabled a sensitive operation previously postponed by storms.",
    "difficulty": "hard",
    "focus": "propitious, enabled, sensitive, postponed, operation"
  },
  {
    "id": "h070",
    "text": "A recondite footnote contained the crucial distinction missed by earlier commentators.",
    "difficulty": "hard",
    "focus": "recondite, crucial, distinction, missed, commentators"
  },
  {
    "id": "h071",
    "text": "Her lachrymose account elicited sympathy but invited doubt about its veracity.",
    "difficulty": "hard",
    "focus": "lachrymose, elicited, doubt, veracity, account"
  },
  {
    "id": "h072",
    "text": "The monolithic organization struggled to accommodate heterodox perspectives and local autonomy.",
    "difficulty": "hard",
    "focus": "monolithic, accommodate, heterodox, perspectives, autonomy"
  },
  {
    "id": "h073",
    "text": "An incendiary editorial inflamed sectarian tensions already smoldering beneath civic discourse.",
    "difficulty": "hard",
    "focus": "incendiary, inflamed, sectarian, smoldering, discourse"
  },
  {
    "id": "h074",
    "text": "His diffident manner disguised encyclopedic expertise in an exceptionally specialized discipline.",
    "difficulty": "hard",
    "focus": "diffident, disguised, encyclopedic, specialized, discipline"
  },
  {
    "id": "h075",
    "text": "The inexorable erosion gradually weakened the promontory's insecure foundations.",
    "difficulty": "hard",
    "focus": "inexorable, erosion, weakened, promontory, insecure"
  }
];
