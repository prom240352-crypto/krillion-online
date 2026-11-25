'use strict';

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

// Shared multi-tier prompt bank for server-authoritative Puffer Party
const PROMPTS = [
  { q: "Name a sport where you're allowed to kick the ball", p: ['soccer','football','american football','rugby','futsal'], c: ['kickball','australian rules football','afl','gaelic football','hacky sack'], s: ['rugby union','rugby league','beach soccer','indoor soccer','canadian football','water polo'], r: ['sepak takraw','footvolley','teqball','bossaball','dodgeball','gaelic'], d: ['cuju','calcio storico','kemari','chinlone','footgolf','jorkyball','padbol','sipa'], k: ['kronum','cycle ball','radball','jianzi','shuttlecock','ba game','shrovetide football','la soule'] },
  { q: 'Name an island nation', p: ['japan','uk','united kingdom','australia','iceland','cuba','ireland','philippines','indonesia'], c: ['madagascar','new zealand','jamaica','sri lanka','taiwan','singapore'], s: ['fiji','bahamas','maldives','cyprus','malta','haiti','dominican republic','barbados','bahrain'], r: ['samoa','tonga','seychelles','mauritius','grenada','saint lucia','trinidad and tobago','solomon islands','papua new guinea'], d: ['vanuatu','palau','kiribati','tuvalu','nauru','micronesia','marshall islands','dominica','antigua and barbuda'], k: ['comoros','sao tome and principe','saint kitts and nevis','saint vincent','timor leste','east timor','cape verde'] },
  { q: 'Name a sea creature', p: ['shark','whale','dolphin','octopus','fish','crab','turtle','starfish','jellyfish'], c: ['narwhal','axolotl','blobfish','mantis shrimp','anglerfish','krill'], s: ['seahorse','orca','stingray','lobster','squid','walrus','manatee','barracuda','eel','clownfish'], r: ['dugong','coelacanth','nautilus','cuttlefish','moray eel','beluga','manta ray','sunfish','mola mola','sea cucumber'], d: ['vampire squid','goblin shark','leafy seadragon','box jellyfish','chambered nautilus','oarfish','vaquita','horseshoe crab'], k: ['siphonophore','yeti crab','barreleye','dumbo octopus','salp','pyrosome','sea pig','bobbit worm','tardigrade'] },
  { q: 'Name a fruit that starts with B', p: ['banana','blueberry','blackberry','blood orange'], c: ['boysenberry','breadfruit','blackcurrant','bergamot'], s: ['bing cherry','bartlett pear','black plum','bosc pear','bitter orange'], r: ['bilberry','baobab','babaco','black sapote','burmese grape','bambangan'], d: ['bilimbi','bignay','biriba','barberry','bearberry','buffaloberry','bacuri','bael'], k: ['bactris','batuan','binjai','bolwarra','brush cherry','burdekin plum','byrsonima'] },
  { q: 'Name a chemical element', p: ['oxygen','hydrogen','carbon','gold','silver','iron','helium','nitrogen'], c: ['uranium','plutonium','titanium','tungsten','mercury','krypton','neon','lithium'], s: ['sodium','potassium','calcium','copper','zinc','aluminum','chlorine','argon','platinum','lead','tin'], r: ['cobalt','nickel','manganese','boron','silicon','phosphorus','sulfur','bromine','iodine','barium','radon'], d: ['gallium','germanium','selenium','strontium','yttrium','zirconium','niobium','molybdenum','rhodium','palladium','cadmium','antimony'], k: ['ytterbium','lutetium','hafnium','tantalum','rhenium','osmium','iridium','thallium','astatine','francium','praseodymium','oganesson'] },
  { q: 'Name a country in Africa', p: ['egypt','south africa','nigeria','kenya','morocco','ghana','ethiopia'], c: ['chad','djibouti','madagascar','niger','zimbabwe','rwanda'], s: ['algeria','tanzania','uganda','senegal','cameroon','tunisia','libya','sudan','angola','mali'], r: ['namibia','botswana','zambia','mozambique','gabon','benin','togo','malawi','liberia','sierra leone'], d: ['eswatini','lesotho','burkina faso','mauritania','eritrea','gambia','burundi','guinea bissau','equatorial guinea'], k: ['comoros','sao tome and principe','sao tome','cabo verde','cape verde','seychelles','mauritius'] },
  { q: 'Name a capital city in Europe', p: ['paris','london','rome','berlin','madrid','amsterdam','athens','vienna'], c: ['reykjavik','vaduz','andorra la vella','vatican city','monaco'], s: ['lisbon','dublin','brussels','prague','warsaw','budapest','stockholm','oslo','copenhagen','helsinki'], r: ['bern','zagreb','belgrade','bucharest','sofia','bratislava','tallinn','riga','vilnius','kyiv'], d: ['ljubljana','tirana','skopje','sarajevo','podgorica','chisinau','valletta','nicosia','luxembourg'], k: ['san marino','pristina','minsk','torshavn','nuuk'] },
  { q: 'Name a musical instrument', p: ['piano','guitar','drums','violin','flute','trumpet','saxophone','cello','bass'], c: ['ukulele','kazoo','theremin','bagpipes','banjo','harp','accordion'], s: ['clarinet','oboe','trombone','tuba','viola','harmonica','xylophone','marimba','tambourine','bongo'], r: ['bassoon','french horn','sitar','mandolin','lute','harpsichord','kalimba','ocarina','didgeridoo','piccolo'], d: ['balalaika','koto','erhu','shamisen','oud','dulcimer','hurdy gurdy','concertina','glockenspiel','celesta','melodica'], k: ['nyckelharpa','glass armonica','hang drum','bandoneon','zither','guzheng','mbira','charango','crwth','serpent','sackbut','shawm'] },
  { q: 'Name a type of pasta', p: ['spaghetti','macaroni','penne','fettuccine','lasagna','ravioli','rigatoni','linguine'], c: ['farfalle','gnocchi','tortellini','rotini','fusilli','angel hair','orzo'], s: ['tagliatelle','pappardelle','ziti','maccheroni','cannelloni','manicotti','bucatini','cavatappi','orecchiette'], r: ['gemelli','campanelle','conchiglie','ditalini','acini di pepe','pastina','stelline','capellini','vermicelli'], d: ['trofie','casarecce','radiatori','strozzapreti','paccheri','mafaldine','cavatelli','malloreddus','pici','pizzoccheri'], k: ['fregola','corzetti','busiate','bigoli','scialatielli','testaroli','lorighittas','su filindeu','tajarin','anolini'] },
  {"q": "บอกชื่ออำเภอในจังหวัดนครราชสีมา (โคราช)", "p": ["เมือง", "เมืองนครราชสีมา", "ปากช่อง", "พิมาย", "สีคิ้ว", "ปักธงชัย", "โชคชัย"], "c": ["วังน้ำเขียว", "ด่านขุนทด", "สูงเนิน", "โนนสูง", "บัวใหญ่"], "s": ["ครบุรี", "เสิงสาง", "จักราช", "ห้วยแถลง", "ชุมพวง", "คง", "ประทาย", "ขามทะเลสอ", "โนนไทย", "เฉลิมพระเกียรติ"], "r": ["ขามสะแกแสง", "บ้านเหลื่อม", "แก้งสนามนาง", "โนนแดง", "สีดา", "หนองบุญมาก"], "d": ["พระทองคำ", "ลำทะเมนชัย", "บัวลาย", "เทพารักษ์", "เมืองยาง"], "k": ["อำเภอเมืองยาง", "อำเภอบัวลาย", "อำเภอลำทะเมนชัย", "อำเภอเทพารักษ์", "อำเภอสีดา"]},
  {"q": "บอกชื่อสถานที่ท่องเที่ยวหรือแลนด์มาร์กในโคราช", "p": ["ย่าโม", "อนุสาวรีย์ท้าวสุรนารี", "เขาใหญ่", "ปราสาทหินพิมาย", "สวนสัตว์โคราช"], "c": ["วัดบ้านไร่", "วัดศาลาลอย", "ประตูชุมพล", "ผาเก็บตะวัน", "ฟาร์มโชคชัย"], "s": ["เขื่อนลำตะคอง", "วังน้ำเขียว", "อุทยานแห่งชาติทับลาน", "ไทรงาม", "บุ่งตาหลั่ว", "สวนน้ำบุ่งตาหลั่ว", "วัดหลวงพ่อโต"], "r": ["ปราสาทหินพนมวัน", "ตลาดน้ำบึงหัวทะเล", "บ่อน้ำผุดบ้านท่าช้าง", "พิพิธภัณฑ์ไม้กลายเป็นหิน", "หอชมเมืองโคราช", "น้ำตกเหวสุวัต"], "d": ["เขายายเที่ยง", "ผารักษ์สลัดได", "ปรางค์กู่", "วัดพายัพ", "อ่างเก็บน้ำห้วยยาง", "บ้านปรางค์", "จุดชมวิวผาเดียวดาย"], "k": ["ปราสาทเมืองแขก", "ปราสาทโนนกู่", "ถ้ำวัวแดง", "สะพานไม้ครบุรี", "ผาชมตะวัน", "ทุ่งกังหันลมห้วยบง"]},
  {"q": "บอกชื่ออาหารหรือของฝากขึ้นชื่อของโคราช", "p": ["ผัดหมี่โคราช", "หมี่โคราช", "ส้มตำ", "กุนเชียง", "หมูยอ", "ไก่ย่าง"], "c": ["ขนมจีนประโดก", "ส้มตำโคราช", "ข้าวเหนียวไก่ย่าง", "หมี่กรอบ", "หมูหยอง"], "s": ["แหนม", "หมูแผ่น", "หมูฝอย", "ไก่ย่างท่าช้าง", "ลาบ", "ก๋วยเตี๋ยว", "ขนมเปี๊ยะ"], "r": ["หมี่ตะคุ", "ข้าวโพดหวานปากช่อง", "น้อยหน่าปากช่อง", "ผัดหมี่พิมาย", "น้ำพริกหมูโคราช", "หมูทุบ"], "d": ["คั่วหมี่", "ขนมจีนน้ำยาประโดก", "ข้าวคั่วโคราช", "ขนมจีนบ้านประโดก", "ปลาดุกร้า", "เมี่ยงคำโคราช"], "k": ["ขนมจีนน้ำยาไก่บ้านประโดก", "กระยาสารทโคราช", "หมูแดดเดียวปักธงชัย", "ผ้าไหมปักธงชัย", "เครื่องปั้นดินเผาด่านเกวียน"]},
  {"q": "บอกชื่อห้าง ตลาด หรือแหล่งช้อปปิ้งในโคราช", "p": ["เดอะมอลล์", "เดอะมอลล์โคราช", "เทอร์มินอล", "เทอร์มินอล 21", "เซ็นทรัล", "เซ็นทรัลโคราช", "เซฟวัน", "ตลาดเซฟวัน"], "c": ["คลังพลาซ่า", "บิ๊กซี", "โลตัส", "แม็คโคร", "ตลาดไนท์บ้านเกาะ"], "s": ["ตลาดแม่กิมเฮง", "ไนท์บ้านเกาะ", "ไนท์บาซาร์", "ตลาดย่าโม", "โฮมโปร", "ตลาดประปา"], "r": ["ตลาดสุรนารี", "ตลาดเทิดไท", "ตลาดหัวรถไฟ", "ตลาดนัดเมย์แฟร์", "เมย์แฟร์", "ตลาด 100 ปี"], "d": ["คลังวิลล่า", "ตลาดน้ำบึงหัวทะเล", "ตลาดสระครก", "ตลาดหนองไผ่ล้อม", "ตลาดโคกกรวด", "ตลาดประตูน้ำ"], "k": ["ตลาดร้อยปีเสิงสาง", "ตลาดเก่าวังน้ำเขียว", "ตลาดโรงเกลือโคราช", "กาดน้ำบึงหัวทะเล", "ตลาดไนท์วัดบูรพ์"]},
  {"q": "บอกชื่อมหาวิทยาลัยหรือวิทยาลัยในโคราช", "p": ["มทส", "มหาวิทยาลัยเทคโนโลยีสุรนารี", "ราชภัฏ", "ราชภัฏโคราช", "มรภ นครราชสีมา", "มทร", "มทร อีสาน"], "c": ["วงษ์ชวลิตกุล", "มหาวิทยาลัยวงษ์ชวลิตกุล", "เทคนิคโคราช", "วิทยาลัยเทคนิค"], "s": ["อาชีวะ", "วิทยาลัยอาชีวศึกษา", "วิทยาลัยพยาบาล", "วิทยาลัยเทคนิคนครราชสีมา", "วิทยาลัยสารพัดช่าง"], "r": ["วิทยาลัยนาฏศิลป", "วิทยาลัยเกษตร", "วิทยาลัยพละ", "มหาวิทยาลัยการกีฬาแห่งชาติ", "วิทยาลัยเทคโนโลยีพณิชยการ"], "d": ["วิทยาลัยเทคนิคหลวงพ่อคูณ", "วิทยาลัยการอาชีพปากช่อง", "วิทยาลัยการอาชีพพิมาย", "วิทยาลัยการอาชีพชุมพวง"], "k": ["วิทยาลัยชุมชนนครราชสีมา", "วิทยาลัยเทคนิคสุรนารี", "วิทยาลัยการอาชีพบัวใหญ่", "สถาบันบัณฑิตพัฒนศิลป์โคราช"]},
  {"q": "บอกชื่อถนนหรือแยกสำคัญในตัวเมืองโคราช", "p": ["มิตรภาพ", "ถนนมิตรภาพ", "ราชดำเนิน", "ถนนราชดำเนิน", "จอมพล", "สุรนารี"], "c": ["30 กันยา", "ถนน 30 กันยา", "ช้างเผือก", "โพธิ์กลาง", "แยกปักธงชัย"], "s": ["ชุมพล", "มุขมนตรี", "อัษฎางค์", "สืบศิริ", "แยกบิ๊กซี", "แยกหัวทะเล", "ถนน 304"], "r": ["แยกพีกาซัส", "แยกประโดก", "แยกจอหอ", "ถนนมหาดไทย", "ถนนจักรี", "ถนนมนัส", "ถนนบัวรอง"], "d": ["ถนนกำแหงสงคราม", "ถนนยมราช", "ถนนสรรพสิทธิ์", "ถนนกีฬากลาง", "ถนนเลียบคลองชลประทาน", "แยกไอที"], "k": ["ถนนพลแสน", "ถนนวัชรสฤษดิ์", "ถนนประจักษ์", "ถนนจอมสุรางค์ยาตร์", "แยกวัดศาลาลอย", "แยกอัมพวัน"]},
  {"q": "บอกชื่อโรงเรียนมัธยมในโคราช", "p": ["ราชสีมาวิทยาลัย", "ราชสีมา", "สุรนารีวิทยา", "สุรนารี", "บุญวัฒนา", "อัสสัมชัญ", "มารีย์วิทยา"], "c": ["ราชสีมาวิทยาลัย 2", "สุรนารีวิทยา 2", "อุบลรัตนราชกัญญา", "สุรธรรมพิทักษ์", "เมืองนครราชสีมา"], "s": ["ปลูกปัญญา", "แองโกลสิงคโปร์", "พิมายวิทยา", "ปากช่อง", "โชคชัยสามัคคี", "ปักธงชัยประชานิรมิต"], "r": ["ขามทะเลสอวิทยา", "สีคิ้วสวัสดิ์ผดุงวิทยา", "ด่านขุนทด", "โนนสูงศรีธานี", "บัวใหญ่", "ครบุรี", "สูงเนิน"], "d": ["มหิศราธิบดี", "เตรียมอุดมศึกษาน้อมเกล้า นครราชสีมา", "สุรนารีวิทยา 2", "ห้วยแถลงพิทยาคม", "คงทองวิทยา", "ประทาย"], "k": ["เสิงสาง", "จักราชวิทยา", "ชุมพวงศึกษา", "หนองบุญมากประสงค์วิทยา", "บ้านเหลื่อมพิทยาสรรพ์", "แก้งสนามนางพิทยาคม"]},
  {"q": "บอกชื่ออาคารหรือสถานที่ภายในโรงเรียนราชสีมาวิทยาลัย", "p": ["โรงอาหาร", "สนามฟุตบอล", "หอประชุม", "อาคาร 1", "เสาธง", "ห้องสมุด"], "c": ["โดม", "อาคาร 2", "อาคาร 3", "อาคาร 4", "อาคาร 5", "อาคาร 6", "สระว่ายน้ำ"], "s": ["อาคาร 7", "อาคารวิทยาศาสตร์", "สนามบาส", "ห้องพยาบาล", "ห้องปกครอง", "สหกรณ์", "ลานหน้าเสาธง"], "r": ["อาคารสิริสีมาพัฒน์", "หอประชุม 113 ปี", "อาคาร 111 ปี", "ธรรมสถาน", "อาคารธรรมสถาน", "เรือนเกษตร", "โรงยิม"], "d": ["บ้านคุณย่า", "ห้องน้ำเทพประคอง", "อาคารพุธ ฐานิโย", "ห้องเกียรติยศ", "หอพระ", "ลานทองกวาว"], "k": ["อาคารธรรมสถานพระภาวนาพิศาลเถระ", "เสาธง 37 เมตร", "ห้องปฏิบัติการดาราศาสตร์", "ศาลาแสดขาว"]},
  {"q": "บอกสัญลักษณ์ สี คติพจน์ หรือสิ่งประจำโรงเรียนราชสีมาวิทยาลัย", "p": ["แสดขาว", "สีแสดขาว", "สีแสด", "สีขาว", "รส", "r.s.", "rs"], "c": ["มานะ วินัย", "มานะ", "วินัย", "ทองกวาว", "ต้นทองกวาว"], "s": ["ดอกจาน", "ดอกทองกวาว", "ลูกแสดขาว", "ราชสีห์", "เสมา", "ตราโรงเรียน"], "r": ["พระพุทธราชสีมามงคลชัย", "เสาธง 37 เมตร", "วัดกลาง", "วัดพระนารายณ์มหาราช", "มาร์ชราชสีมา"], "d": ["เสมาธรรมจักร", "พระประธาน 59 นิ้ว", "สิงห์แสดขาว", "คำขวัญมานะวินัย"], "k": ["butea monosperma", "พุทธาภิเษก 2530", "เกียรติศักดิ์แสดขาว", "เสาธงใหญ่ที่สุดในโคราช"]},
  {"q": "บอกชื่อสายการเรียนหรือห้องเรียนพิเศษในโรงเรียนราชสีมาวิทยาลัย", "p": ["วิทย์คณิต", "ศิลป์คำนวณ", "ศิลป์ภาษา", "ep", "english program"], "c": ["กิฟเต็ด", "gifted", "smte", "ห้องพิเศษ", "ห้องพิเศษวิทย์"], "s": ["ศิลป์จีน", "ศิลป์ญี่ปุ่น", "ศิลป์ฝรั่งเศส", "วิทย์คอม", "ห้องเรียนพิเศษคณิต", "ห้องเรียนปกติ"], "r": ["สอวน", "ศูนย์ สอวน", "วิทยาศาสตร์พลังสิบ", "วิทย์พลังสิบ", "ห้องเรียนกีฬา", "ศิลป์เกาหลี"], "d": ["พสวท", "ห้องเรียนพิเศษวิทย์คณิต", "ห้องเรียนมาตรฐานสากล", "world class standard", "วิทย์วิศวะ"], "k": ["ห้องเรียนพิเศษวิทยาศาสตร์ คณิตศาสตร์ เทคโนโลยีและสิ่งแวดล้อม", "โครงการพัฒนาอัจฉริยภาพ", "สอวน คณิตศาสตร์"]},
  {"q": "บอกชื่อกิจกรรม ชมรม หรือกีฬาเด่นของโรงเรียนราชสีมาวิทยาลัย", "p": ["กีฬาสี", "ฟุตบอล", "บาสเกตบอล", "วงโยธวาทิต", "วงโย", "ลูกเสือ"], "c": ["รด", "รักษาดินแดน", "วอลเลย์บอล", "แบดมินตัน", "ปิงปอง", "สภานักเรียน"], "s": ["ดนตรีสากล", "ดนตรีไทย", "วันวิทยาศาสตร์", "วันไหว้ครู", "กีฬาสีแสดขาว", "กรีฑา", "ฟุตซอล"], "r": ["โยธวาทิตโลก", "แปรอักษร", "เชียร์ลีดเดอร์", "หุ่นยนต์", "อีสปอร์ต", "ค่าย สอวน", "วิ่งแสดขาว"], "d": ["รักบี้", "ว่ายน้ำ", "เทควันโด", "ชมรมถ่ายภาพ", "ชมรมดาราศาสตร์", "บวงสรวงย่าโม", "พิธีประดับเข็ม"], "k": ["ประกวดวงโยธวาทิตโลก", "ค่ายวิทยาศาสตร์พลังสิบ", "วันต้นไม้ประจำปี", "แข่งหุ่นยนต์ สพฐ"]},
  {"q": "บอกชื่อวิชาที่เรียนในโรงเรียนราชสีมาวิทยาลัย", "p": ["คณิตศาสตร์", "คณิต", "ภาษาไทย", "ไทย", "ภาษาอังกฤษ", "อังกฤษ", "วิทยาศาสตร์", "วิทย์", "พละ", "สังคม"], "c": ["ฟิสิกส์", "เคมี", "ชีววิทยา", "ชีวะ", "คอมพิวเตอร์", "ประวัติศาสตร์"], "s": ["ศิลปะ", "ดนตรี", "สุขศึกษา", "การงาน", "การงานอาชีพ", "แนะแนว", "หน้าที่พลเมือง"], "r": ["ดาราศาสตร์", "วิทยาการคำนวณ", "ภาษาจีน", "ภาษาญี่ปุ่น", "โครงงาน", "โลกและอวกาศ", "เศรษฐศาสตร์"], "d": ["สถิติ", "แคลคูลัส", "ภาษาฝรั่งเศส", "นาฏศิลป์", "พระพุทธศาสนา", "ลูกเสือเนตรนารี", "เทคโนโลยี"], "k": ["คณิตศาสตร์เพิ่มเติม", "ฟิสิกส์เพิ่มเติม", "เคมีวิเคราะห์", "การเขียนโปรแกรม", "ภูมิศาสตร์กายภาพ"]},
  {"q": "บอกชื่อสถานที่หรือจุดนัดพบแถวโรงเรียนราชสีมาวิทยาลัย", "p": ["เซเว่น", "7-11", "หน้าโรงเรียน", "เซฟวัน", "ตลาดเซฟวัน", "เดอะมอลล์"], "c": ["สะพานลอย", "ป้ายรถเมล์", "ปั๊ม ปตท", "โลตัส", "บิ๊กซี", "ร้านน้ำหน้าโรงเรียน"], "s": ["ถนนมิตรภาพ", "โคกกรวด", "มทส", "ตลาดเทิดไท", "โฮมโปร", "บ้านใหม่", "ประตูน้ำ"], "r": ["แยกปักธงชัย", "อ่างห้วยยาง", "วัดบ้านใหม่", "ศาลปกครอง", "สนามกีฬา 80 พรรษา", "ตลาดโคกกรวด"], "d": ["สวนสัตว์โคราช", "ปั๊มบางจาก", "หมู่บ้านสุรนารีวิลล์", "ซอยสามยอด", "สามยอด", "ตลาดสามยอด"], "k": ["ทางคู่ขนานมิตรภาพ", "สะพานลอยราชสีมา", "วัดใหม่สระประทุม", "อ่างเก็บน้ำห้วยยาง"]},
  {"q": "บอกสิ่งของที่นักเรียนราชสีมาวิทยาลัยต้องพกไปโรงเรียน", "p": ["กระเป๋า", "ปากกา", "สมุด", "มือถือ", "โทรศัพท์", "เงิน", "บัตรนักเรียน"], "c": ["ดินสอ", "ยางลบ", "ไม้บรรทัด", "ลิควิด", "หนังสือ", "หนังสือเรียน"], "s": ["ขวดน้ำ", "เข็มขัด", "รองเท้า", "ถุงเท้า", "เสื้อพละ", "หูฟัง", "พาวเวอร์แบงค์"], "r": ["ไอแพด", "แท็บเล็ต", "เครื่องคิดเลข", "แฟ้ม", "ตารางสอน", "ร่ม", "แว่นตา", "กุญแจรถ"], "d": ["ปากกาไฮไลท์", "กระเป๋าดินสอ", "สมุดบันทึกความดี", "หมวกกันน็อก", "เสื้อกันหนาว", "ทิชชู่"], "k": ["วงเวียน", "ครึ่งวงกลม", "ไม้ที", "ตารางธาตุ", "สมุดพก", "เข็มกลัด รส"]},
  {"q": "บอกชื่อจังหวัดในประเทศไทย", "p": ["กรุงเทพ", "กรุงเทพมหานคร", "เชียงใหม่", "ภูเก็ต", "นครราชสีมา", "โคราช", "ชลบุรี", "ขอนแก่น"], "c": ["เชียงราย", "อยุธยา", "พระนครศรีอยุธยา", "สงขลา", "อุดรธานี", "สุราษฎร์ธานี", "กระบี่"], "s": ["ระยอง", "กาญจนบุรี", "นครปฐม", "นนทบุรี", "ปทุมธานี", "สมุทรปราการ", "บุรีรัมย์", "สุรินทร์", "อุบลราชธานี", "พิษณุโลก", "นครสวรรค์"], "r": ["น่าน", "เลย", "ตรัง", "พังงา", "ประจวบคีรีขันธ์", "เพชรบุรี", "จันทบุรี", "ตราด", "ลำปาง", "แพร่", "สุโขทัย", "ร้อยเอ็ด", "ศรีสะเกษ"], "d": ["บึงกาฬ", "อำนาจเจริญ", "มุกดาหาร", "หนองบัวลำภู", "อุทัยธานี", "สิงห์บุรี", "อ่างทอง", "ระนอง", "สตูล", "แม่ฮ่องสอน", "ยโสธร", "พะเยา"], "k": ["สมุทรสงคราม", "นครนายก", "ชัยนาท", "พิจิตร", "พัทลุง", "ปัตตานี", "ยะลา", "นราธิวาส", "สระแก้ว", "หนองคาย"]},
  {"q": "บอกชื่ออาหารไทยยอดนิยม", "p": ["ผัดไทย", "ต้มยำกุ้ง", "ส้มตำ", "กะเพรา", "ผัดกะเพรา", "ข้าวมันไก่", "ข้าวผัด"], "c": ["แกงเขียวหวาน", "มัสมั่น", "หมูกระทะ", "ก๋วยเตี๋ยวเรือ", "ข้าวซอย", "พะแนง"], "s": ["ลาบ", "น้ำตก", "ต้มข่าไก่", "ยำวุ้นเส้น", "ไข่เจียว", "หมูปิ้ง", "แกงส้ม", "ทอดมัน", "ข้าวขาหมู", "ผัดซีอิ๊ว"], "r": ["ห่อหมก", "ขนมจีนน้ำยา", "แกงเทโพ", "ยำปลาดุกฟู", "ไก่ทอดหาดใหญ่", "คอหมูย่าง", "ต้มแซ่บ", "ข้าวคลุกกะปิ", "ผัดพริกแกง"], "d": ["แกงฮังเล", "คั่วกลิ้ง", "แกงไตปลา", "น้ำพริกอ่อง", "น้ำพริกหนุ่ม", "ผัดสะตอ", "แกงเลียง", "หมูชะมวง", "ข้าวแช่"], "k": ["หลนเต้าเจี้ยว", "แสร้งว่า", "แกงรัญจวน", "ม้าฮ่อ", "หมูโสร่ง", "แกงคั่วหอยขม", "น้ำพริกลงเรือ", "ขนมจีนซาวน้ำ"]},
  {"q": "บอกชื่อขนมไทย", "p": ["ข้าวเหนียวมะม่วง", "ทองหยิบ", "ทองหยอด", "ฝอยทอง", "ลอดช่อง", "บัวลอย"], "c": ["ขนมชั้น", "ขนมครก", "ขนมเบื้อง", "ทับทิมกรอบ", "สังขยา", "ข้าวต้มมัด"], "s": ["กล้วยบวชชี", "เม็ดขนุน", "ลูกชุบ", "วุ้นกะทิ", "ขนมตาล", "ขนมกล้วย", "ตะโก้", "ขนมหม้อแกง", "ข้าวหลาม", "ขนมถ้วย"], "r": ["ขนมต้ม", "ขนมเทียน", "ขนมใส่ไส้", "อาลัว", "ขนมผิง", "ขนมเปียกปูน", "ข้าวเหนียวสังขยา", "ครองแครง", "ถั่วแปบ"], "d": ["จ่ามงกุฎ", "เสน่ห์จันทร์", "ทองเอก", "ขนมลืมกลืน", "ปลากริมไข่เต่า", "ข้าวเม่าทอด", "ขนมเรไร", "ขนมดอกจอก"], "k": ["บุหลันดั้นเมฆ", "สัมปันนี", "ดาราทอง", "ช่อม่วง", "ขนมพระพาย", "ขนมเกสรลำเจียก", "ขนมบุหลัน", "ขนมหินฝนทอง"]},
  {"q": "บอกชื่อเกาะหรือทะเลในประเทศไทย", "p": ["ภูเก็ต", "เกาะสมุย", "สมุย", "เกาะล้าน", "พัทยา", "หัวหิน", "เกาะพีพี"], "c": ["เกาะช้าง", "เกาะเสม็ด", "เกาะพะงัน", "เกาะเต่า", "บางแสน", "ชะอำ"], "s": ["เกาะหลีเป๊ะ", "เกาะสิมิลัน", "เกาะกูด", "เกาะสีชัง", "เกาะลันตา", "อ่าวมาหยา", "ทะเลแหวก"], "r": ["เกาะสุรินทร์", "เกาะห้อง", "เกาะหมาก", "เกาะพยาม", "เกาะนางยวน", "เกาะแสมสาร", "เกาะขาม", "หาดใหญ่"], "d": ["เกาะมุก", "เกาะกระดาน", "เกาะรอก", "เกาะตะรุเตา", "เกาะตาชัย", "เกาะไม้ท่อน", "เกาะราชา", "เกาะยาวน้อย"], "k": ["เกาะพระทอง", "เกาะอาดัง", "เกาะราวี", "เกาะลิบง", "เกาะสุกร", "เกาะมันนอก", "เกาะจาน", "เกาะทะลุ"]},
  {"q": "บอกชื่อแม่น้ำหรือภูเขา/ดอยในประเทศไทย", "p": ["เจ้าพระยา", "แม่น้ำเจ้าพระยา", "ดอยอินทนนท์", "แม่น้ำโขง", "แม่น้ำปิง", "ภูกระดึง"], "c": ["ดอยสุเทพ", "เขาใหญ่", "ภูทับเบิก", "แม่น้ำมูล", "แม่น้ำชี", "แม่น้ำน่าน"], "s": ["แม่น้ำวัง", "แม่น้ำยม", "แม่น้ำแคว", "แม่น้ำบางปะกง", "แม่น้ำท่าจีน", "แม่น้ำแม่กลอง", "ดอยอ่างขาง", "ภูชี้ฟ้า"], "r": ["ดอยหลวงเชียงดาว", "ดอยผ้าห่มปก", "ดอยเสมอดาว", "ภูเรือ", "แม่น้ำป่าสัก", "แม่น้ำตาปี", "เขาค้อ", "ดอยแม่สลอง"], "d": ["ภูสอยดาว", "เขาหลวง", "เขาคิชฌกูฏ", "แม่น้ำสะแกกรัง", "แม่น้ำเพชรบุรี", "แม่น้ำปัตตานี", "ดอยช้าง", "ภูบักได"], "k": ["โมโกจู", "ยอดเขาโมโกจู", "ดอยปุย", "แม่น้ำสงคราม", "แม่น้ำโก-ลก", "เขาสก", "ภูผาม่าน", "ดอยม่อนจอง"]},
  {"q": "บอกชื่อเทศกาลหรือวันสำคัญของไทย", "p": ["สงกรานต์", "วันสงกรานต์", "ลอยกระทง", "วันลอยกระทง", "ปีใหม่", "วันแม่", "วันพ่อ", "วันเด็ก"], "c": ["วันเข้าพรรษา", "วันออกพรรษา", "มาฆบูชา", "วิสาขบูชา", "อาสาฬหบูชา", "วันครู", "วันไหว้ครู"], "s": ["บุญบั้งไฟ", "ผีตาโขน", "แห่เทียนพรรษา", "กินเจ", "เทศกาลกินเจ", "ยี่เป็ง", "วันจักรี", "วันปิยมหาราช"], "r": ["สารทเดือนสิบ", "ชักพระ", "ไหลเรือไฟ", "ตักบาตรเทโว", "วันพืชมงคล", "วันรัฐธรรมนูญ", "วันแรงงาน"], "d": ["ปอยส่างลอง", "รับบัว", "อุ้มพระดำน้ำ", "สลากภัต", "วิ่งควาย", "บุญคูณลาน", "วันสุนทรภู่"], "k": ["ประเพณีตานก๋วยสลาก", "บุญผะเหวด", "แห่นางแมว", "ประเพณีชิงเปรต", "ลอยเรือชาวเล", "เทศกาลโคมแสนดวง"]},
  {"q": "บอกชื่อผลไม้ในประเทศไทย", "p": ["ทุเรียน", "มะม่วง", "มังคุด", "เงาะ", "แตงโม", "กล้วย", "ส้ม", "มะพร้าว"], "c": ["ลำไย", "ลิ้นจี่", "สับปะรด", "มะละกอ", "ฝรั่ง", "ขนุน", "ชมพู่"], "s": ["น้อยหน่า", "ส้มโอ", "ลองกอง", "ลางสาด", "กระท้อน", "สละ", "ระกำ", "พุทรา", "ทับทิม", "แก้วมังกร", "เสาวรส"], "r": ["มะยงชิด", "มะปราง", "มะเฟือง", "มะไฟ", "มะขาม", "มะขามเทศ", "น้อยโหน่ง", "ลูกตาล", "มะยม"], "d": ["ลูกหว้า", "ตะขบ", "มะขามป้อม", "มะดัน", "มะกอกน้ำ", "จำปาดะ", "อินทผลัม", "มะตูม"], "k": ["หมากเม่า", "ลูกเนียง", "มะมุด", "กระจับ", "ลูกหยี", "มะพูด", "มะหาด", "ลูกชิด", "ตะลิงปลิง"]},
  { q: 'Name a classic video game franchise', p: ['mario','super mario','minecraft','pokemon','zelda','tetris','pacman','pac man','fortnite','gta','call of duty'], c: ['sonic','doom','halo','final fantasy','roblox','among us','portal'], s: ['street fighter','mortal kombat','resident evil','metal gear','metroid','donkey kong','kirby','animal crossing','skyrim','elder scrolls','fallout'], r: ['castlevania','mega man','chrono trigger','earthbound','star fox','f zero','silent hill','bioshock','mass effect','half life','deus ex'], d: ['suikoden','breath of fire','klonoa','ape escape','jet set radio','panzer dragoon','shenmue','parasite eve','vagrant story','golden sun'], k: ['chibi robo','custom robo','baten kaitos','radiant historia','ghost trick','etrian odyssey','alundra','terranigma','lufia','rhythm heaven'] }
];

const TIERS = {
  plankton: { key: 'plankton', label: 'PLANKTON', pts: 10, color: '#88b4cc' },
  clever:   { key: 'clever',   label: 'TOO CLEVER', pts: 15, color: '#2dd4bf' },
  schooler: { key: 'schooler', label: 'SCHOOLER', pts: 30, color: '#50e0f8' },
  rare:     { key: 'rare',     label: 'RARE', pts: 60, color: '#e6557e' },
  deepcut:  { key: 'deepcut',  label: 'DEEP CUT', pts: 85, color: '#a855f7' },
  krillion: { key: 'krillion', label: 'ONE IN A KRILLION', pts: 100, color: '#facc15' }
};

function normalizeText(str) {
  return (str || '').toLowerCase().normalize('NFC')
    .replace(/[^a-z0-9\u0E00-\u0E7F\s]/g, ' ').replace(/\b(the|a|an)\b/g, ' ').replace(/\s+/g, ' ').trim();
}
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]; dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}
function titleCase(str) { return str.replace(/\b\w/g, c => c.toUpperCase()); }
function evaluateAnswer(prompt, rawInput) {
  const clean = normalizeText(rawInput);
  if (!clean || clean.length < 2) return { matched: false };
  const order = [['krillion', prompt.k], ['deepcut', prompt.d], ['rare', prompt.r], ['schooler', prompt.s], ['clever', prompt.c], ['plankton', prompt.p]];
  for (const [k, list] of order) {
    for (const item of list) {
      const ni = normalizeText(item);
      if (clean === ni || clean.replace(/\s+/g,'') === ni.replace(/\s+/g,'') || clean === ni + 's' || clean + 's' === ni || clean === ni + 'es') {
        return { matched: true, tier: TIERS[k], canonical: titleCase(item) };
      }
    }
  }
  let best = null;
  for (const [k, list] of order) {
    for (const item of list) {
      const ni = normalizeText(item);
      const maxD = ni.length >= 8 ? 2 : (ni.length >= 4 ? 1 : 0);
      if (!maxD) continue;
      const d = levenshtein(clean, ni);
      if (d <= maxD && (!best || d < best.d)) best = { d, tier: TIERS[k], canonical: titleCase(item) };
    }
  }
  return best ? { matched: true, tier: best.tier, canonical: best.canonical } : { matched: false };
}

// =========================================================================
// ROOM MANAGER
// =========================================================================
const rooms = new Map();

function genRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function getPublicRoomList() {
  const list = [];
  for (const r of rooms.values()) {
    if (!r.isPublic) continue;
    const host = r.players.find(p => p.id === r.hostId) || r.players[0];
    list.push({
      code: r.code,
      host: host ? host.name : 'Diver',
      cur: r.players.length,
      max: r.maxPlayers,
      status: r.status === 'playing' ? 'PLAYING' : 'IN THE LOBBY',
      full: r.players.length >= r.maxPlayers
    });
  }
  return list;
}

function getRealPufferPlayingCount() {
  let count = 0;
  for (const room of rooms.values()) {
    count += room.players.filter(player => !player.isBot).length;
  }
  return count;
}

function broadcastPublicRooms() {
  io.emit('public_rooms', {
    rooms: getPublicRoomList(),
    onlineCount: io.engine.clientsCount,
    pufferPlayingCount: getRealPufferPlayingCount()
  });
}

function serializeRoom(r) {
  return {
    code: r.code,
    hostId: r.hostId,
    isPublic: r.isPublic,
    status: r.status,
    players: r.players,
    turnIdx: r.turnIdx,
    promptQ: r.prompt ? r.prompt.q : '',
    used: Array.from(r.usedDisplay),
    fuse: Number(r.fuse.toFixed(1)),
    maxFuse: Number(r.maxFuse.toFixed(1)),
    inflation: Number(r.inflation.toFixed(2)),
    log: r.log,
    winner: r.winner || null
  };
}

function emitRoomState(r) {
  io.to(r.code).emit('room_state', serializeRoom(r));
}

function clearRoomTimers(r) {
  if (r.tickId) { clearInterval(r.tickId); r.tickId = null; }
  if (r.botTimer) { clearTimeout(r.botTimer); r.botTimer = null; }
  if (r.roundDelay) { clearTimeout(r.roundDelay); r.roundDelay = null; }
}

function startNextRound(r) {
  clearRoomTimers(r);
  const alive = r.players.filter(p => p.hearts > 0);
  if (alive.length <= 1) {
    r.status = 'finished';
    r.winner = alive[0] ? alive[0].name : 'No one';
    r.log = `${r.winner} wins Puffer Party!`;
    emitRoomState(r);
    broadcastPublicRooms();
    return;
  }
  r.status = 'playing';
  r.winner = null;
  const promptPool = PROMPTS.filter(prompt => prompt !== r.prompt);
  const availablePrompts = promptPool.length ? promptPool : PROMPTS;
  r.prompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
  r.used = new Set();
  r.usedDisplay = [];
  r.maxFuse = 13 + Math.random() * 5;
  r.fuse = r.maxFuse;
  r.inflation = 1.0;
  while (r.players[r.turnIdx] && r.players[r.turnIdx].hearts <= 0) {
    r.turnIdx = (r.turnIdx + 1) % r.players.length;
  }
  r.log = 'Fresh round — name a valid answer to pass!';
  emitRoomState(r);
  scheduleBotIfNeeded(r);

  let lastTs = Date.now();
  r.tickId = setInterval(() => {
    const now = Date.now();
    const dt = (now - lastTs) / 1000;
    lastTs = now;
    r.fuse = Math.max(0, r.fuse - dt);
    io.to(r.code).emit('fuse_tick', { fuse: Number(r.fuse.toFixed(1)), maxFuse: Number(r.maxFuse.toFixed(1)), inflation: r.inflation });
    if (r.fuse <= 0) {
      clearRoomTimers(r);
      const victim = r.players[r.turnIdx];
      if (victim) victim.hearts = Math.max(0, victim.hearts - 1);
      r.log = `POP! ${victim ? victim.name : 'Player'} lost a heart!`;
      io.to(r.code).emit('puffer_pop', { victimName: victim ? victim.name : 'Player' });
      emitRoomState(r);
      r.roundDelay = setTimeout(() => {
        if (rooms.has(r.code)) startNextRound(r);
      }, 1600);
    }
  }, 150);
}

function scheduleBotIfNeeded(r) {
  if (r.botTimer) { clearTimeout(r.botTimer); r.botTimer = null; }
  const cur = r.players[r.turnIdx];
  if (!cur || !cur.isBot || r.status !== 'playing') return;
  r.botTimer = setTimeout(() => {
    if (!rooms.has(r.code) || r.status !== 'playing') return;
    const p = r.prompt;
    const pool = [...p.p, ...p.s, ...p.c, ...p.r, ...p.d].filter(a => !r.used.has(normalizeText(a)));
    if (pool.length) {
      const pick = pool[Math.floor(Math.random() * Math.min(pool.length, 14))];
      processSubmission(r, cur.id, pick);
    }
  }, 1500 + Math.random() * 1800);
}

function processSubmission(r, playerId, rawAnswer, playerUid) {
  if (r.status !== 'playing') return { ok: false, msg: 'Match not active' };
  const cur = r.players[r.turnIdx];
  if (!cur || (cur.id !== playerId && (!playerUid || cur.uid !== playerUid))) {
    return { ok: false, msg: 'Not your turn' };
  }

  const ev = evaluateAnswer(r.prompt, rawAnswer);
  if (!ev.matched) return { ok: false, msg: `"${(rawAnswer || '').trim()}": no echo. try again` };
  const norm = normalizeText(ev.canonical);
  if (r.used.has(norm)) return { ok: false, msg: `"${ev.canonical}" already used!` };

  r.used.add(norm);
  r.usedDisplay.push({ word: ev.canonical, color: ev.tier.color });
  if (ev.tier.pts >= 60) {
    r.inflation = Math.max(0.88, r.inflation - 0.12);
    r.fuse = Math.min(r.maxFuse, r.fuse + 1.8);
    r.log = `${cur.name}: ${ev.canonical} (${ev.tier.label}) — cooled!`;
  } else {
    r.inflation = Math.min(1.45, r.inflation + 0.08);
    r.log = `${cur.name}: ${ev.canonical} (${ev.tier.label}) — swelled!`;
  }
  do {
    r.turnIdx = (r.turnIdx + 1) % r.players.length;
  } while (r.players[r.turnIdx].hearts <= 0);

  io.to(r.code).emit('answer_accepted', { tierKey: ev.tier.key });
  emitRoomState(r);
  scheduleBotIfNeeded(r);
  return { ok: true };
}

io.on('connection', socket => {
  socket.emit('public_rooms', {
    rooms: getPublicRoomList(),
    onlineCount: io.engine.clientsCount,
    pufferPlayingCount: getRealPufferPlayingCount()
  });
  broadcastPublicRooms();

  socket.on('list_rooms', () => {
    socket.emit('public_rooms', {
      rooms: getPublicRoomList(),
      onlineCount: io.engine.clientsCount,
      pufferPlayingCount: getRealPufferPlayingCount()
    });
  });

  socket.on('create_room', ({ name, skin, isPublic, uid } = {}) => {
    leaveCurrentRoom(socket);
    const code = genRoomCode();
    const room = {
      code, hostId: socket.id, isPublic: isPublic !== false, maxPlayers: 6, status: 'lobby',
      players: [{ id: socket.id, uid: uid || socket.id, name: (name || '').trim().slice(0, 18) || 'Diver', skin: skin || 'krill', isBot: false, hearts: 3 }],
      turnIdx: 0, prompt: null, used: new Set(), usedDisplay: [], fuse: 14, maxFuse: 14, inflation: 1, log: 'Waiting for players...'
    };
    rooms.set(code, room);
    socket.join(code);
    socket.data.roomCode = code;
    emitRoomState(room);
    broadcastPublicRooms();
  });

  socket.on('join_room', ({ code, name, skin, uid } = {}) => {
    const cleanCode = (code || '').trim().toUpperCase();
    const room = rooms.get(cleanCode);
    if (!room) { socket.emit('room_error', { msg: `Room ${cleanCode} not found` }); return; }
    if (room.players.length >= room.maxPlayers) { socket.emit('room_error', { msg: `Room ${cleanCode} is full` }); return; }
    leaveCurrentRoom(socket);
    room.players.push({ id: socket.id, uid: uid || socket.id, name: (name || '').trim().slice(0, 18) || 'Diver', skin: skin || 'krill', isBot: false, hearts: 3 });
    socket.join(cleanCode);
    socket.data.roomCode = cleanCode;
    room.log = `${room.players[room.players.length - 1].name} joined the reef!`;
    emitRoomState(room);
    broadcastPublicRooms();
  });

  socket.on('add_bot', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id || room.players.length >= room.maxPlayers || room.status === 'playing') return;
    const names = ['Coral', 'Manta', 'Kelp', 'Nautilus', 'Orca'];
    const botName = `${names[room.players.length % names.length]} (bot)`;
    room.players.push({ id: 'bot_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6), name: botName, skin: 'puffer', isBot: true, hearts: 3 });
    room.log = `${botName} joined the lobby.`;
    emitRoomState(room);
    broadcastPublicRooms();
  });

  socket.on('start_match', () => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 2) {
      // Auto-add 1 bot if host starts solo
      room.players.push({ id: 'bot_' + Date.now(), name: 'Coral (bot)', skin: 'puffer', isBot: true, hearts: 3 });
    }
    room.players.forEach(p => { p.hearts = 3; });
    room.turnIdx = 0;
    startNextRound(room);
    broadcastPublicRooms();
  });

  socket.on('submit_puffer', ({ answer, uid } = {}) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room) return;
    const res = processSubmission(room, socket.id, answer, uid);
    if (!res.ok) socket.emit('puffer_reject', { msg: res.msg });
  });

  socket.on('leave_room', () => leaveCurrentRoom(socket));
  socket.on('disconnect', () => { leaveCurrentRoom(socket); broadcastPublicRooms(); });
});

function leaveCurrentRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  socket.leave(code);
  socket.data.roomCode = null;
  if (!room) return;
  room.players = room.players.filter(p => p.id !== socket.id);
  const humans = room.players.filter(p => !p.isBot);
  if (humans.length === 0) {
    clearRoomTimers(room);
    rooms.delete(code);
  } else {
    if (room.hostId === socket.id) room.hostId = humans[0].id;
    if (room.turnIdx >= room.players.length) room.turnIdx = 0;
    emitRoomState(room);
  }
  broadcastPublicRooms();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Krillion Online server listening on http://localhost:${PORT}`));

function shutdown() {
  io.close(() => console.log('Krillion Online server shut down cleanly.'));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
