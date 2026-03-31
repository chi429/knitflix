// Standalone content data: fiber wiki (icons + entries + rating labels)
// Loaded as a plain script (globals) to keep the project simple.

window.FIBER_RATING_LABELS = {
  zh:{softness:'柔軟',warmth:'保暖',durability:'耐用',care:'易護理',price:'性價比'},
  en:{softness:'Soft',warmth:'Warm',durability:'Durable',care:'Easy Care',price:'Value'}
};

window.FIBER_RATING_COLORS = {
  softness:'#c4622d',
  warmth:'#b8923a',
  durability:'#6a9470',
  care:'#4a88b8',
  price:'#8855bb'
};

window.FIBER_ICONS = {
  merino:`<i class="pix-cloud"></i>`,
  cashmere:`<i class="pix-heart"></i>`,
  cotton:`<i class="pix-sun"></i>`,
  linen:`<i class="pix-file"></i>`,
  alpaca:`<i class="pix-mood-happy"></i>`,
  mohair:`<i class="pix-wind"></i>`,
  acrylic:`<i class="pix-flask"></i>`,
  angora:`<i class="pix-mood-neutral"></i>`,
};

window.FIBERS = [
  {icon:window.FIBER_ICONS.merino,c:'#f8ede0',nz:'美麗諾羊毛',ne:'Merino Wool',tz:'天然動物纖維',te:'Natural Animal Fiber',dz:'最受歡迎嘅羊毛，纖維幼細柔軟，親膚唔刺激，適合所有年齡包括嬰兒。',de:'Most popular wool. Extra-fine and soft, suitable for all ages including babies.',tr:{softness:5,warmth:4,durability:3,care:2,price:2},uz:['頸巾','帽','毛衣','嬰兒衫'],ue:['Scarves','Hats','Sweaters','Baby items'],cz:['冷水手洗','唔可烘乾','平放晾乾'],ce:['Hand wash cold','No tumble dry','Dry flat']},
  {icon:window.FIBER_ICONS.cashmere,c:'#f5e8cc',nz:'喀什米爾 Cashmere',ne:'Cashmere',tz:'天然動物纖維',te:'Natural Animal Fiber',dz:'最頂級天然纖維之一，極度輕柔，但價格昂貴且需小心保養。',de:'One of the finest natural fibers. Incredibly soft and lightweight but delicate.',tr:{softness:5,warmth:5,durability:2,care:1,price:1},uz:['高級毛衣','頸巾','披肩'],ue:['Luxury sweaters','Scarves','Wraps'],cz:['冷水手洗','唔可熱水','平放晾乾'],ce:['Cold hand wash only','No heat','Dry flat']},
  {icon:window.FIBER_ICONS.cotton,c:'#deeede',nz:'棉線 Cotton',ne:'Cotton',tz:'天然植物纖維',te:'Natural Plant Fiber',dz:'透氣涼爽，夏天首選。唔縮水，適合amigurumi同夏日服飾。香港天氣最實用。',de:'Breathable and cool — perfect for HK weather. Great for amigurumi and summer garments.',tr:{softness:3,warmth:1,durability:4,care:5,price:4},uz:['夏日衫','Amigurumi','袋','嬰兒衫'],ue:['Summer wear','Amigurumi','Bags','Baby items'],cz:['可機洗','可晾曬','易打理'],ce:['Machine washable','Line dry','Easy care']},
  {icon:window.FIBER_ICONS.linen,c:'#eee8cc',nz:'亞麻 Linen',ne:'Linen',tz:'天然植物纖維',te:'Natural Plant Fiber',dz:'比棉線更透氣，質地略硬但越洗越軟，適合夏日包包同有結構性嘅織物。',de:'More breathable than cotton. Stiffness softens with washing. Great for bags and home goods.',tr:{softness:2,warmth:1,durability:5,care:5,price:3},uz:['手袋','家居用品','夏日衫'],ue:['Bags','Home goods','Summer tops'],cz:['可機洗','越洗越軟'],ce:['Machine washable','Softens with use']},
  {icon:window.FIBER_ICONS.alpaca,c:'#ede0cc',nz:'羊駝絨 Alpaca',ne:'Alpaca',tz:'天然動物纖維',te:'Natural Animal Fiber',dz:'比羊毛更輕，保暖性極強，不含lanolin，適合對羊毛過敏人士。但彈性低易拉長。',de:'Lighter than wool, excellent warmth. Lanolin-free. Less elastic — can stretch.',tr:{softness:4,warmth:5,durability:3,care:2,price:2},uz:['毛衣','披肩','帽'],ue:['Sweaters','Shawls','Hats'],cz:['冷水手洗','平放晾乾','唔可拉扯'],ce:['Hand wash cold','Dry flat','Avoid stretching']},
  {icon:window.FIBER_ICONS.mohair,c:'#ede0f5',nz:'馬海毛 Mohair',ne:'Mohair',tz:'天然動物纖維',te:'Natural Animal Fiber',dz:'安哥拉山羊嘅毛，蓬鬆有光澤，常與絲混紡（如Kidsilk Haze）製造夢幻halo效果。',de:'From Angora goats. Often blended with silk for dreamy halo effect.',tr:{softness:3,warmth:4,durability:3,care:2,price:2},uz:['毛衣（疊穿）','披肩','帽'],ue:['Sweaters (layered)','Shawls','Hats'],cz:['冷水手洗','平放晾乾','避免摩擦'],ce:['Hand wash cold','Dry flat','Avoid friction']},
  {icon:window.FIBER_ICONS.acrylic,c:'#ddeaf5',nz:'腈綸 Acrylic',ne:'Acrylic',tz:'人工合成纖維',te:'Synthetic Fiber',dz:'最易保養、最平價，可機洗，顏色最多，初學者及兒童項目首選。',de:'Most affordable and easy-care. Machine washable, huge colour range. Great for beginners.',tr:{softness:3,warmth:3,durability:5,care:5,price:5},uz:['Amigurumi','兒童衫','毯子','練習'],ue:['Amigurumi',"Children's",'Blankets','Practice'],cz:['可機洗','最易打理','最平價'],ce:['Machine washable','Easiest care','Most affordable']},
  {icon:window.FIBER_ICONS.angora,c:'#f5dde8',nz:'安哥拉兔毛 Angora',ne:'Angora',tz:'天然動物纖維',te:'Natural Animal Fiber',dz:'極致柔軟蓬鬆，但掉毛嚴重難保養，通常同其他纖維混紡。',de:'Extremely soft and fluffy but sheds significantly. Usually blended.',tr:{softness:5,warmth:4,durability:1,care:1,price:2},uz:['高級配件','裝飾性編織'],ue:['Luxury accessories','Decorative pieces'],cz:['輕柔冷水手洗','平放晾乾','會掉毛'],ce:['Gentle cold hand wash','Dry flat','Significant shedding']},
];

