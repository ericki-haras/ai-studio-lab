/* ==========================================================================
   Rafaela's Lab — tarot draw
   78 cards, 78 fortunes. Scoped to this lab folder only.
   ========================================================================== */
(function () {
  "use strict";

  var CARDS = [
    // ---- Arcanos maiores ----
    { tag: "Arcano maior · 0", symbol: "🌟", name: "O Louco", text: "Um começo completamente novo está se abrindo diante de você, sem mapa e sem garantias. Essa incerteza não é motivo de medo, é convite para confiar no seu próprio instinto. Dê o primeiro passo mesmo sem ver o caminho inteiro." },
    { tag: "Arcano maior · I", symbol: "🪄", name: "O Mago", text: "Você tem, neste momento, todos os recursos que precisa para começar algo importante. A situação está pedindo ação, não mais planejamento. Confie na sua capacidade de transformar intenção em resultado." },
    { tag: "Arcano maior · II", symbol: "🌙", name: "A Sacerdotisa", text: "Uma resposta que você procura do lado de fora já está dentro de você. Antes de perguntar para os outros, escute o silêncio um pouco mais. A intuição vai acertar onde a lógica ainda hesita." },
    { tag: "Arcano maior · III", symbol: "🌸", name: "A Imperatriz", text: "Algo que você tem cuidado com atenção está prestes a florescer visivelmente. Um projeto, uma relação ou uma ideia entra em uma fase de abundância genuína. Permita-se receber, não só dar." },
    { tag: "Arcano maior · IV", symbol: "👑", name: "O Imperador", text: "Uma estrutura mais firme na sua vida vai trazer a segurança que você andava buscando. Organizar, definir limites e assumir o controle vai parecer mais natural do que rígido. A disciplina, dessa vez, é liberdade, não prisão." },
    { tag: "Arcano maior · V", symbol: "📜", name: "O Hierofante", text: "Um conselho ou tradição antiga vai fazer mais sentido do que você esperava. Vale a pena ouvir quem já passou por esse caminho antes de você. Nem toda regra é limitação — algumas são atalho." },
    { tag: "Arcano maior · VI", symbol: "💞", name: "Os Enamorados", text: "Uma escolha entre dois caminhos igualmente sedutores está se aproximando. Não existe decisão errada, só decisão que exige compromisso de verdade. Escolha com o coração alinhado à razão, não um contra o outro." },
    { tag: "Arcano maior · VII", symbol: "🏇", name: "O Carro", text: "Uma vitória está próxima, mas ela vai exigir foco total e direção clara. Forças contrárias vão tentar te puxar para lados diferentes ao mesmo tempo. Mantenha as rédeas firmes e o destino não muda." },
    { tag: "Arcano maior · VIII", symbol: "🦁", name: "A Força", text: "Uma situação difícil vai ser resolvida mais pela sua calma do que pela sua força bruta. Coragem, dessa vez, parece gentileza e paciência, não confronto. Domesticar o próprio medo é a maior vitória que vem por aí." },
    { tag: "Arcano maior · IX", symbol: "🏮", name: "O Eremita", text: "Um período de recolhimento vai trazer clareza que a vida agitada não permitia ver. Afastar-se um pouco do barulho não é fuga, é busca por verdade. A luz que você procura já está na sua própria lanterna." },
    { tag: "Arcano maior · X", symbol: "🎡", name: "A Roda da Fortuna", text: "Uma virada de sorte está a caminho, trazida por forças que não dependem só de você. O que sobe também desce, e o que desce também sobe — é hora de aceitar o giro. Aproveite o momento favorável sem se apegar demais a ele." },
    { tag: "Arcano maior · XI", symbol: "⚖️", name: "A Justiça", text: "Uma situação pendente vai finalmente se resolver de forma justa, ainda que não do jeito que você imaginava. As consequências de escolhas passadas chegam agora com equilíbrio, não com punição. A verdade tende a se acertar por conta própria." },
    { tag: "Arcano maior · XII", symbol: "🔄", name: "O Enforcado", text: "Olhar a mesma situação de um ângulo completamente diferente vai revelar algo que estava escondido. Ficar parado por um momento não é fracasso, é preparação. A resposta aparece quando você para de forçar." },
    { tag: "Arcano maior · XIII", symbol: "🦋", name: "A Morte", text: "Um ciclo está terminando de verdade, e resistir a isso só vai prolongar o desconforto. O que termina agora abre espaço para algo que ainda não cabia na sua vida. Deixe ir para poder receber o que vem depois." },
    { tag: "Arcano maior · XIV", symbol: "🌈", name: "A Temperança", text: "Um equilíbrio que parecia impossível entre duas partes da sua vida vai começar a se encaixar. Paciência e mistura gradual vão funcionar melhor do que qualquer solução drástica. As coisas vão se ajustar no seu próprio tempo." },
    { tag: "Arcano maior · XV", symbol: "⛓️", name: "O Diabo", text: "Um apego ou hábito que já não serve mais vai ficar visível de um jeito difícil de ignorar. A prisão que você sente é real, mas a chave está mais acessível do que parece. Perceber a corrente já é o primeiro passo para soltá-la." },
    { tag: "Arcano maior · XVI", symbol: "⚡", name: "A Torre", text: "Uma mudança brusca e inesperada vai desmontar algo que parecia sólido. O choque inicial é maior que o dano real — o que cai já estava com a base fraca. O que se reconstrói depois vai ser mais verdadeiro." },
    { tag: "Arcano maior · XVII", symbol: "✨", name: "A Estrela", text: "Depois de um período difícil, uma sensação de esperança genuína está voltando. Um sinal de que o pior já passou vai aparecer de forma sutil, quase silenciosa. Confie que as coisas estão se curando, mesmo sem pressa." },
    { tag: "Arcano maior · XVIII", symbol: "🌕", name: "A Lua", text: "Nem tudo vai estar claro nos próximos dias, e está tudo bem não ter todas as respostas agora. Emoções confusas ou sonhos vívidos podem trazer mensagens importantes. Confie no que você sente, mesmo sem conseguir explicar direito." },
    { tag: "Arcano maior · XIX", symbol: "☀️", name: "O Sol", text: "Um período de clareza, energia e alegria genuína está se abrindo para você. O que estava nebuloso vai finalmente ficar visível sob uma luz melhor. Aproveite esse momento de vitalidade sem desconfiar dele." },
    { tag: "Arcano maior · XX", symbol: "📯", name: "O Julgamento", text: "Um chamado importante, quase inevitável, está prestes a se fazer ouvir. É hora de acertar contas com o passado para poder seguir mais leve. Uma decisão definitiva vai trazer alívio, não mais peso." },
    { tag: "Arcano maior · XXI", symbol: "🌍", name: "O Mundo", text: "Um ciclo importante está se completando exatamente como deveria. O que você construiu ao longo do caminho agora se mostra inteiro, reconhecível. Celebre essa conquista antes de já pensar no próximo passo." },

    // ---- Paus ----
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Ás de Paus", text: "Uma chispa de energia nova está se acendendo bem na sua frente. Aproveite esse impulso enquanto ele está fresco, porque a inspiração não espera. Nos próximos dias, uma ideia ou convite vai pedir que você diga sim." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Dois de Paus", text: "Você está com um pé no que já construiu e outro mirando um horizonte maior. A decisão que parece grande hoje vai parecer natural em poucas semanas. Confie no mapa que você mesmo está desenhando." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Três de Paus", text: "As sementes que você plantou há um tempo começam a brotar visivelmente. Um projeto ou plano ganha tração além do que você esperava. É hora de olhar para o horizonte com mais confiança do que cautela." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Quatro de Paus", text: "Uma comemoração pequena, mas sincera, está chegando — talvez discreta, talvez ruidosa. Pessoas que você ama vão se juntar a você num momento de conquista. Aproveite a pausa antes do próximo ciclo de trabalho." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Cinco de Paus", text: "Uma pequena disputa de egos vai testar sua paciência, mas não sua posição. Ninguém está realmente perdendo, só disputando o mesmo palco. Escolha suas batalhas e o resto se resolve sozinho." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Seis de Paus", text: "Um reconhecimento que você não pediu está vindo — e vai ser bem-vindo. Seu esforço recente não passou despercebido, mesmo em silêncio. Deixe-se ser visto por uma vez." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Sete de Paus", text: "Alguém vai questionar um espaço que você já considera seu. Fique firme, mas sem gastar energia demais defendendo o óbvio. Sua posição é mais sólida do que a dúvida sugere." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Oito de Paus", text: "As coisas estão prestes a acelerar rápido, quase de repente. Uma mensagem, resposta ou notícia vai mudar o ritmo da semana. Não é hora de planejar demais — é hora de agir." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Nove de Paus", text: "Você está mais perto do fim de um esforço longo do que imagina. O cansaço é real, mas não é sinal de fracasso, só de quase-chegada. Mais um fôlego e a linha de chegada aparece." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Dez de Paus", text: "Um peso que você carrega há tempos está prestes a ser entregue ou dividido. Você não precisa levar tudo sozinho até o fim — pedir ajuda também é vitória. O alívio vem logo depois da entrega." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Valete de Paus", text: "Uma ideia impulsiva e um tanto ingênua vai bater à sua porta. Ela merece mais curiosidade do que ceticismo. Um pequeno risco calculado nas próximas semanas pode virar uma aventura." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Cavaleiro de Paus", text: "Uma decisão rápida está a caminho, e ela vai exigir coragem, não certeza absoluta. Você vai sentir vontade de agir antes de pensar demais — e dessa vez isso ajuda. Siga o impulso, mas olhe duas vezes antes de atravessar." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Rainha de Paus", text: "Sua confiança natural vai atrair gente e oportunidades sem esforço extra. Alguém vai se inspirar só de ver como você conduz as coisas. Use esse brilho para abrir uma porta que estava só entreaberta." },
    { tag: "Arcano menor · Paus", symbol: "🔥", name: "Rei de Paus", text: "Uma posição de liderança, formal ou não, está se desenhando para você. As pessoas ao redor já te veem como referência, mesmo que você ainda não tenha percebido. Aceite o papel com a mesma ousadia que te trouxe até aqui." },

    // ---- Copas ----
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Ás de Copas", text: "Um sentimento novo e genuíno está prestes a encher seu peito. Pode ser um encontro, uma reconciliação ou simplesmente uma alegria sem motivo aparente. Deixe-se emocionar sem precisar explicar por quê." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Dois de Copas", text: "Uma conexão vai se aprofundar através de uma conversa simples e sincera. Duas pessoas que se entendem sem esforço vão se aproximar ainda mais. O que era afinidade começa a virar cumplicidade." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Três de Copas", text: "Um encontro com amigos ou família vai trazer mais leveza do que você espera. Celebrar junto de outras pessoas vai curar algo que a solidão não conseguia. Diga sim ao convite, mesmo cansado." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Quatro de Copas", text: "Você vai sentir vontade de recuar um pouco das ofertas ao seu redor. Isso não é ingratidão, é apenas um sinal de que você precisa de silêncio antes de escolher. Dê a si mesmo essa pausa sem culpa." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Cinco de Copas", text: "Uma decepção recente ainda pesa mais do que devia. Mas, ao virar a cabeça, você vai notar que nem tudo se perdeu — só uma parte. O que sobrou é mais forte do que parece agora." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Seis de Copas", text: "Uma lembrança boa do passado vai reaparecer de forma inesperada. Alguém ou algo de outros tempos volta trazendo mais conforto do que nostalgia dolorida. Aproveite o reencontro sem medo de recair no que já passou." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Sete de Copas", text: "Muitas possibilidades emocionais vão aparecer ao mesmo tempo, quase confundindo você. Nem todas são reais como parecem à primeira vista. Escolha com o coração, mas confira com os pés no chão." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Oito de Copas", text: "Vai ficar cada vez mais claro que algo já não faz mais sentido para você. Afastar-se, mesmo do que é confortável, é o gesto mais honesto que você pode ter agora. O que vem depois vale mais que o que você está deixando." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Nove de Copas", text: "Uma satisfação simples, quase pessoal, está prestes a se concretizar. Não vai precisar da aprovação de ninguém para sentir que valeu a pena. Esse contentamento é só seu para guardar." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Dez de Copas", text: "Um momento de harmonia em família ou entre pessoas queridas está se formando. É o tipo de dia comum que, olhando para trás, vira memória especial. Esteja presente para sentir isso por completo." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Valete de Copas", text: "Uma mensagem afetuosa e um pouco inesperada está a caminho. Pode vir de alguém jovem ou de um lado mais sensível de você mesmo. Receba com abertura, mesmo que pareça fora de hora." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Cavaleiro de Copas", text: "Um convite romântico ou criativo vai chegar de forma quase cinematográfica. Alguém vai se aproximar seguindo mais o coração do que a lógica. Corresponda no mesmo tom, sem pressa de racionalizar." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Rainha de Copas", text: "Sua sensibilidade vai ser o que resolve uma situação delicada nos próximos dias. As pessoas vão buscar você justamente pela sua capacidade de escutar sem julgar. Confie nessa intuição mesmo sem provas concretas." },
    { tag: "Arcano menor · Copas", symbol: "💧", name: "Rei de Copas", text: "Você vai precisar manter a calma emocional enquanto tudo ao redor pede reação. Essa serenidade vai ser notada e vai inspirar mais gente do que você imagina. Liderar com afeto vale mais que liderar com controle." },

    // ---- Espadas ----
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Ás de Espadas", text: "Uma verdade clara está prestes a cortar a confusão que rondava sua cabeça. Uma decisão vai ficar surpreendentemente óbvia quando você parar de evitar o assunto. Use essa clareza antes que ela se esconda de novo." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Dois de Espadas", text: "Uma escolha difícil vai exigir que você pare de adiar. Ficar em cima do muro está custando mais energia do que decidir de qualquer lado. Tire a venda, mesmo que a resposta assuste um pouco." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Três de Espadas", text: "Uma palavra dita, ouvida ou lembrada vai doer mais do que deveria. Essa dor é passageira, ainda que pareça definitiva agora. Dê-se permissão para sentir antes de seguir adiante." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Quatro de Espadas", text: "Seu corpo e sua mente estão pedindo uma trégua que você tem ignorado. Um descanso curto vai valer mais que qualquer solução apressada. Pare antes que a exaustão decida por você." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Cinco de Espadas", text: "Uma discussão vai deixar claro que ganhar nem sempre é o mesmo que estar certo. Vale mais preservar uma relação do que vencer um argumento. Escolha a paz quando puder escolher." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Seis de Espadas", text: "Uma mudança de cenário, mesmo pequena, vai trazer alívio real. Sair de onde você está — literal ou mentalmente — é o primeiro passo de uma travessia necessária. As águas ficam mais calmas à frente." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Sete de Espadas", text: "Algo que você tem evitado encarar de frente vai pedir atenção esta semana. Um atalho ou meia-verdade só vai adiar o desconforto. Enfrentar agora custa menos do que parece." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Oito de Espadas", text: "Uma sensação de estar preso é mais mental do que real. As saídas existem, só estão escondidas pelo próprio medo de olhar para elas. Um passo pequeno já rompe o círculo." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Nove de Espadas", text: "Uma preocupação que cresce de noite está maior na sua cabeça do que na realidade. O problema é real, mas o tamanho dele não é. Durma sobre isso antes de decidir qualquer coisa." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Dez de Espadas", text: "Um capítulo difícil está finalmente chegando ao fundo do poço — e isso é bom sinal. Não existe mais para onde cair, só para onde subir. O pior já passou, mesmo que ainda não pareça." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Valete de Espadas", text: "Uma informação nova vai chegar de forma direta, talvez até sem filtro. Vale mais ouvir com curiosidade do que reagir na defensiva. A verdade dita sem rodeios vai ajudar mais do que incomodar." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Cavaleiro de Espadas", text: "Uma atitude rápida e sem meias-palavras vai ser necessária em breve. Você vai precisar dizer o que pensa antes que o momento passe. Só cuide para que a pressa não vire atropelo." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Rainha de Espadas", text: "Sua clareza mental vai ser o que corta um impasse ao seu redor. As pessoas vão recorrer a você justamente pela sua capacidade de ver sem ilusão. Diga a verdade com firmeza, mas sem perder a gentileza." },
    { tag: "Arcano menor · Espadas", symbol: "⚔️", name: "Rei de Espadas", text: "Uma decisão importante vai exigir mais lógica do que sentimento nos próximos dias. Você tem os fatos necessários para decidir bem, mesmo que a decisão seja difícil. Confie na sua própria racionalidade." },

    // ---- Ouros ----
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Ás de Ouros", text: "Uma oportunidade concreta, quase palpável, está se aproximando. Pode vir como dinheiro, proposta de trabalho ou um recurso que você não esperava. Comece pequeno, porque essa semente cresce com o tempo." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Dois de Ouros", text: "Você vai precisar equilibrar mais de uma responsabilidade ao mesmo tempo. É possível dar conta de tudo, só não do jeito perfeito que você imagina. Flexibilidade vale mais que controle total agora." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Três de Ouros", text: "Um trabalho em equipe vai dar resultados melhores do que qualquer esforço solitário. Suas habilidades vão se somar às de outra pessoa de um jeito que impressiona. Aceite ajuda sem achar que isso diminui o seu mérito." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Quatro de Ouros", text: "Uma vontade de segurar tudo com força vai aparecer nos próximos dias. Um pouco de cautela é saudável, mas segurar demais também sufoca. Solte um pouco antes que a mão feche demais." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Cinco de Ouros", text: "Uma fase mais apertada financeira ou materialmente está passando, não ficando. Pedir ajuda não é fracasso, é estratégia. O que falta agora volta em outra forma em breve." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Seis de Ouros", text: "Uma troca justa está se formando — seja dando ou recebendo apoio. O equilíbrio entre generosidade e necessidade vai aparecer claramente. Aceite ou ofereça sem constrangimento." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Sete de Ouros", text: "Um investimento de tempo ou esforço está prestes a mostrar se vale a pena continuar. É hora de avaliar com calma, não de desistir nem de insistir no automático. A resposta vem observando, não forçando." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Oito de Ouros", text: "Um período de dedicação técnica e repetitiva vai trazer resultado visível em breve. O trabalho que parece invisível está, na verdade, sendo notado. Continue no ritmo, o refinamento está vindo." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Nove de Ouros", text: "Uma conquista que é só sua, feita com as próprias mãos, está se consolidando. Você vai sentir o gosto de uma independência conquistada com esforço. Aproveite esse momento sem precisar compartilhar com ninguém." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Dez de Ouros", text: "Uma estrutura de longo prazo — família, patrimônio ou legado — se fortalece nos próximos tempos. O que você constrói agora não é só para você, é para o que vem depois. Pense em raízes, não só em frutos." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Valete de Ouros", text: "Uma nova habilidade ou oportunidade de aprendizado prática está surgindo. Vale a pena estudar, testar e ter paciência com o próprio ritmo. O que parece pequeno agora é a base de algo maior." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Cavaleiro de Ouros", text: "Um progresso lento, mas absolutamente constante, está em curso. Não é hora de acelerar, é hora de manter o passo. A consistência vale mais que a velocidade nesse momento." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Rainha de Ouros", text: "Você vai encontrar conforto em cuidar de algo prático — casa, corpo, rotina ou dinheiro. Essa atenção ao concreto vai trazer uma sensação rara de estabilidade. Cuidar de si também é uma forma de prosperar." },
    { tag: "Arcano menor · Ouros", symbol: "🪙", name: "Rei de Ouros", text: "Uma fase de segurança material bem construída está se consolidando ao seu redor. O esforço de tempos atrás finalmente se traduz em conforto real. Aproveite essa estabilidade sem esquecer de continuar generoso." }
  ];

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var card = document.querySelector("[data-tarot-card]");
  var button = document.querySelector("[data-tarot-draw]");
  var tagEl = document.querySelector("[data-tarot-tag]");
  var symbolEl = document.querySelector("[data-tarot-symbol]");
  var nameEl = document.querySelector("[data-tarot-name]");
  var textEl = document.querySelector("[data-tarot-text]");
  var hintEl = document.querySelector("[data-tarot-hint]");
  var liveEl = document.querySelector("[data-tarot-live]");

  if (!card || !button) return;

  var rotation = 0;
  var revealed = false;
  var lastIndex = -1;
  var busy = false;

  function pickCard() {
    var index = Math.floor(Math.random() * CARDS.length);
    if (CARDS.length > 1 && index === lastIndex) {
      index = (index + 1) % CARDS.length;
    }
    lastIndex = index;
    return CARDS[index];
  }

  function render(fortune) {
    tagEl.textContent = fortune.tag;
    symbolEl.textContent = fortune.symbol;
    nameEl.textContent = fortune.name;
    textEl.textContent = fortune.text;
    hintEl.textContent = "Carta revelada · clique para tirar outra";
    liveEl.textContent = fortune.name + ". " + fortune.text;
  }

  function reveal() {
    var fortune = pickCard();
    render(fortune);
    rotation += 180;
    card.style.transform = "rotateY(" + rotation + "deg)";
    revealed = true;
    busy = false;
    button.disabled = false;
    button.textContent = "Tirar outra carta";
  }

  function draw() {
    if (busy) return;
    busy = true;
    button.disabled = true;

    if (calm) {
      reveal();
      return;
    }

    if (!revealed) {
      reveal();
      return;
    }

    // already showing a card: flip face-down first, then reveal a new one
    rotation += 180;
    card.style.transform = "rotateY(" + rotation + "deg)";
    revealed = false;

    var onFlippedDown = function () {
      card.removeEventListener("transitionend", onFlippedDown);
      reveal();
    };
    card.addEventListener("transitionend", onFlippedDown);
  }

  button.addEventListener("click", draw);
})();
