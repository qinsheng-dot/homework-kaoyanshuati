const { initDb } = require('./database');
const Question = require('./models/question');
const User = require('./models/user');

const seedQuestions = [
  {
    subject: '政治',
    chapter: '马克思主义基本原理',
    type: 'single',
    content: '哲学的基本问题是（）',
    options: {
      A: '物质和运动的关系问题',
      B: '思维和存在的关系问题',
      C: '实践和认识的关系问题',
      D: '真理和价值的关系问题'
    },
    answer: 'B',
    explanation: '哲学的基本问题是思维和存在的关系问题，即意识与物质的关系问题。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '马克思主义基本原理',
    type: 'single',
    content: '马克思主义的根本理论特征是（）',
    options: {
      A: '科学性和革命性的统一',
      B: '实践性的基础上科学性与革命性的统一',
      C: '实践性的基础上阶级性与实践性的统一',
      D: '科学性与实践性的统一'
    },
    answer: 'B',
    explanation: '马克思主义的根本理论特征是以实践为基础的科学性与革命性的统一。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '马克思主义基本原理',
    type: 'multiple',
    content: '下列选项中，属于唯物辩证法基本规律的有（）',
    options: {
      A: '量变质变规律',
      B: '对立统一规律',
      C: '否定之否定规律',
      D: '内容与形式规律'
    },
    answer: 'ABC',
    explanation: '唯物辩证法的三大基本规律是：对立统一规律、量变质变规律、否定之否定规律。',
    difficulty: 2
  },
  {
    subject: '政治',
    chapter: '马克思主义基本原理',
    type: 'single',
    content: '实践是检验真理的唯一标准，这是因为（）',
    options: {
      A: '实践具有直接现实性',
      B: '实践是认识的来源',
      C: '实践是认识发展的动力',
      D: '实践是认识的目的'
    },
    answer: 'A',
    explanation: '实践具有直接现实性的特点，能够把主观认识与客观实际联系起来加以对照。',
    difficulty: 2
  },
  {
    subject: '政治',
    chapter: '马克思主义基本原理',
    type: 'fill',
    content: '辩证法的核心是______规律。',
    options: null,
    answer: '对立统一',
    explanation: '对立统一规律是唯物辩证法的实质和核心。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '毛泽东思想和中国特色社会主义理论体系',
    type: 'single',
    content: '毛泽东思想形成的时代条件是（）',
    options: {
      A: '俄国十月革命',
      B: '中国革命的胜利',
      C: '帝国主义战争与无产阶级革命',
      D: '社会主义制度在中国建立'
    },
    answer: 'C',
    explanation: '毛泽东思想形成的时代条件是帝国主义战争与无产阶级革命的时代主题。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '毛泽东思想和中国特色社会主义理论体系',
    type: 'single',
    content: '社会主义初级阶段的主要矛盾是（）',
    options: {
      A: '人民日益增长的物质文化需要同落后的社会生产之间的矛盾',
      B: '生产力和生产关系的矛盾',
      C: '经济基础和上层建筑的矛盾',
      D: '人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾'
    },
    answer: 'A',
    explanation: '党的十九大之前，社会主义初级阶段的主要矛盾是人民日益增长的物质文化需要同落后的社会生产之间的矛盾。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '毛泽东思想和中国特色社会主义理论体系',
    type: 'multiple',
    content: '中国特色社会主义的基本特征包括（）',
    options: {
      A: '坚持中国共产党的领导',
      B: '坚持人民当家作主',
      C: '坚持依法治国',
      D: '坚持改革开放'
    },
    answer: 'ABC',
    explanation: '中国特色社会主义的基本特征包括坚持党的领导、人民当家作主和依法治国的有机统一。',
    difficulty: 2
  },
  {
    subject: '政治',
    chapter: '中国近代史纲要',
    type: 'single',
    content: '中国近代史上第一个不平等条约是（）',
    options: {
      A: '南京条约',
      B: '马关条约',
      C: '辛丑条约',
      D: '天津条约'
    },
    answer: 'A',
    explanation: '1842年签订的《南京条约》是中国近代史上第一个不平等条约。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '中国近代史纲要',
    type: 'single',
    content: '五四运动爆发的直接原因是（）',
    options: {
      A: '巴黎和会上中国外交的失败',
      B: '新文化运动的兴起',
      C: '马克思主义在中国的传播',
      D: '俄国十月革命的影响'
    },
    answer: 'A',
    explanation: '1919年巴黎和会上中国外交的失败是五四运动爆发的直接原因。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '思想道德与法治',
    type: 'single',
    content: '社会主义核心价值观在国家层面的价值目标是（）',
    options: {
      A: '自由、平等、公正、法治',
      B: '爱国、敬业、诚信、友善',
      C: '富强、民主、文明、和谐',
      D: '独立、自主、创新、发展'
    },
    answer: 'C',
    explanation: '社会主义核心价值观分为三个层面：国家层面是富强、民主、文明、和谐。',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '高等数学',
    type: 'single',
    content: '设函数f(x)在x=0处连续，则下列结论正确的是（）',
    options: {
      A: 'f(x)在x=0处可导',
      B: 'lim(x->0)f(x)存在',
      C: 'lim(x->0)f(x)=f(0)',
      D: '以上都不对'
    },
    answer: 'B',
    explanation: '连续函数的极限等于函数值，即lim(x->0)f(x)=f(0)，所以极限存在。',
    difficulty: 2
  },
  {
    subject: '数学',
    chapter: '高等数学',
    type: 'single',
    content: '若f\'(x0)=0，则x0一定是f(x)的（）',
    options: {
      A: '极大值点',
      B: '极小值点',
      C: '驻点',
      D: '拐点'
    },
    answer: 'C',
    explanation: '导数为零的点称为驻点，但不一定是极值点。',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '高等数学',
    type: 'fill',
    content: '定积分∫₀¹ x² dx = ______',
    options: null,
    answer: '1/3',
    explanation: '∫₀¹ x² dx = [x³/3]₀¹ = 1/3 - 0 = 1/3',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '高等数学',
    type: 'single',
    content: '函数y = e^x的导数是（）',
    options: {
      A: 'e^x',
      B: 'xe^(x-1)',
      C: 'e^(x+1)',
      D: '1/e^x'
    },
    answer: 'A',
    explanation: 'e^x的导数等于它本身，即(e^x)\' = e^x。',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '高等数学',
    type: 'single',
    content: '∫e^x dx = （）',
    options: {
      A: 'e^x + C',
      B: 'xe^x + C',
      C: 'e^(x+1)/(x+1) + C',
      D: 'ln|e^x| + C'
    },
    answer: 'A',
    explanation: 'e^x的不定积分等于e^x + C。',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '线性代数',
    type: 'single',
    content: '设A为3阶矩阵，|A|=2，则|-2A|等于（）',
    options: {
      A: '-16',
      B: '16',
      C: '-4',
      D: '4'
    },
    answer: 'A',
    explanation: '|kA| = kⁿ|A|，所以|-2A| = (-2)³ × 2 = -8 × 2 = -16',
    difficulty: 2
  },
  {
    subject: '数学',
    chapter: '线性代数',
    type: 'single',
    content: '向量组α₁,α₂,...,αₛ线性无关的充分必要条件是（）',
    options: {
      A: '存在不全为零的数k₁,k₂,...,kₛ使k₁α₁+k₂α₂+...+kₛαₛ=0',
      B: '向量组中任意两个向量线性无关',
      C: '向量组中不存在零向量',
      D: '秩等于向量的个数'
    },
    answer: 'D',
    explanation: '向量组线性无关的充分必要条件是其秩等于向量的个数。',
    difficulty: 2
  },
  {
    subject: '数学',
    chapter: '线性代数',
    type: 'fill',
    content: '单位矩阵I的行列式值为______。',
    options: null,
    answer: '1',
    explanation: '单位矩阵的行列式值等于1。',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '概率论与数理统计',
    type: 'single',
    content: '设随机变量X~N(0,1)，则P(X<1.5)=（）',
    options: {
      A: '0.9332',
      B: '0.8413',
      C: '0.1587',
      D: '0.0668'
    },
    answer: 'A',
    explanation: '标准正态分布表查得P(X<1.5)=0.9332',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '概率论与数理统计',
    type: 'single',
    content: '设A、B为随机事件，P(A)=0.3，P(B)=0.4，P(A∪B)=0.6，则P(AB)=（）',
    options: {
      A: '0.1',
      B: '0.2',
      C: '0.3',
      D: '0.4'
    },
    answer: 'A',
    explanation: 'P(A∪B)=P(A)+P(B)-P(AB)，所以0.6=0.3+0.4-P(AB)，P(AB)=0.1',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '概率论与数理统计',
    type: 'single',
    content: '若随机变量X服从参数为λ的泊松分布，则E(X)=（）',
    options: {
      A: 'λ',
      B: 'λ²',
      C: '1/λ',
      D: '√λ'
    },
    answer: 'A',
    explanation: '泊松分布的数学期望等于其参数λ。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '词汇与语法',
    type: 'single',
    content: 'The professor demanded that every student ______ a report after the experiment.',
    options: {
      A: 'hand in',
      B: 'hands in',
      C: 'handed in',
      D: 'will hand in'
    },
    answer: 'A',
    explanation: 'demand后面的宾语从句使用虚拟语气，谓语动词用(should)+动词原形。',
    difficulty: 1
  },
  {
    subject: '英语',
    chapter: '词汇与语法',
    type: 'single',
    content: 'It is essential that he ______ the truth of the accident.',
    options: {
      A: 'knows',
      B: 'know',
      C: 'knew',
      D: 'will know'
    },
    answer: 'B',
    explanation: 'essential后面的主语从句使用虚拟语气，谓语动词用(should)+动词原形。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '词汇与语法',
    type: 'single',
    content: 'By the time you arrive, we ______ the meeting.',
    options: {
      A: 'will finish',
      B: 'will have finished',
      C: 'have finished',
      D: 'finished'
    },
    answer: 'B',
    explanation: 'by the time引导的时间状语从句，主句用将来完成时。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '词汇与语法',
    type: 'single',
    content: 'The manager suggested that the meeting ______ postponed until next week.',
    options: {
      A: 'is',
      B: 'be',
      C: 'was',
      D: 'should'
    },
    answer: 'B',
    explanation: 'suggest后面的宾语从句使用虚拟语气，谓语动词用(should)+动词原形。',
    difficulty: 1
  },
  {
    subject: '英语',
    chapter: '阅读理解',
    type: 'single',
    content: 'Passage: Artificial Intelligence (AI) has become an integral part of modern society. From voice assistants like Siri and Alexa to self-driving cars, AI is transforming various industries. While AI offers numerous benefits such as increased efficiency and improved accuracy, it also raises concerns about job displacement and ethical issues. Experts argue that proper regulation and ethical guidelines are essential to ensure AI is developed responsibly.\n\nWhat is the main idea of this passage?',
    options: {
      A: 'AI is only used in voice assistants',
      B: 'AI has both benefits and challenges',
      C: 'AI will replace all human workers',
      D: 'AI development should be unregulated'
    },
    answer: 'B',
    explanation: '文章既提到了AI的好处（提高效率、提高准确性），也提到了担忧（工作岗位流失、伦理问题），所以主旨是AI既有好处也有挑战。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '阅读理解',
    type: 'single',
    content: 'Passage: Climate change is one of the most pressing issues facing our planet today. Rising global temperatures are causing melting ice caps, rising sea levels, and extreme weather events. Scientists warn that urgent action is needed to reduce greenhouse gas emissions and transition to renewable energy sources. Failure to act could have catastrophic consequences for future generations.\n\nAccording to the passage, what is the main cause of climate change?',
    options: {
      A: 'Melting ice caps',
      B: 'Extreme weather events',
      C: 'Greenhouse gas emissions',
      D: 'Rising sea levels'
    },
    answer: 'C',
    explanation: '文章指出需要减少温室气体排放来应对气候变化，说明温室气体排放是气候变化的主要原因。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '阅读理解',
    type: 'multiple',
    content: 'Passage: The Internet has revolutionized the way we communicate and access information. Social media platforms allow people to connect with friends and family across the globe, while search engines provide instant access to vast amounts of knowledge. However, the internet also brings challenges such as privacy concerns, misinformation, and addiction. It is important for users to develop digital literacy skills to navigate the online world safely.\n\nWhich of the following are mentioned as challenges of the internet?',
    options: {
      A: 'Privacy concerns',
      B: 'Instant access to information',
      C: 'Misinformation',
      D: 'Global communication'
    },
    answer: 'AC',
    explanation: '文章提到互联网带来的挑战包括隐私问题（privacy concerns）和错误信息（misinformation）。即时获取信息和全球通讯是互联网的好处。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '翻译',
    type: 'short',
    content: 'Translate the following English sentence into Chinese:\n\n"Education is the key to unlocking human potential and building a better future."',
    options: null,
    answer: '教育是释放人类潜能、建设更美好未来的关键。',
    explanation: '这是一个英语句子翻译成中文的练习。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '翻译',
    type: 'short',
    content: 'Translate the following Chinese sentence into English:\n\n"科技的快速发展正在改变我们的生活方式。"',
    options: null,
    answer: 'The rapid development of technology is changing our way of life.',
    explanation: '这是一个中文句子翻译成英语的练习。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '完形填空',
    type: 'single',
    content: 'Passage: The importance of reading cannot be overstated. Reading helps us ______ knowledge, develop critical thinking skills, and expand our vocabulary. It allows us to explore new ideas and perspectives, fostering creativity and imagination. Whether it is a novel, a newspaper, or an academic article, reading enriches our lives in countless ways.\n\nChoose the best word to fill in the blank:',
    options: {
      A: 'gain',
      B: 'lose',
      C: 'ignore',
      D: 'forget'
    },
    answer: 'A',
    explanation: '根据上下文，阅读帮助我们"获得"知识(gain knowledge)，其他选项不符合语境。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '完形填空',
    type: 'single',
    content: 'Passage: In today\'s fast-paced world, time management has become essential. With so many tasks and distractions, it is easy to feel overwhelmed. Effective time management involves prioritizing tasks, setting realistic goals, and avoiding procrastination. By managing our time well, we can reduce stress and ______ productivity.\n\nChoose the best word to fill in the blank:',
    options: {
      A: 'decrease',
      B: 'improve',
      C: 'destroy',
      D: 'waste'
    },
    answer: 'B',
    explanation: '根据上下文，通过良好的时间管理，我们可以减少压力并"提高"生产力(improve productivity)。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '写作',
    type: 'short',
    content: 'Write a composition about "The Importance of Reading" in about 100 words.',
    options: null,
    answer: 'Reading is of great importance in our life. First, it broadens our knowledge and helps us understand the world better. Second, reading can improve our thinking ability and language skills. Third, a good book can inspire us and provide spiritual nourishment. In conclusion, we should develop the habit of reading and choose valuable books to read.',
    explanation: '这是一篇关于阅读重要性的短文写作范文。',
    difficulty: 2
  },
  {
    subject: '专业课',
    chapter: '数据结构',
    type: 'single',
    content: '在长度为n的顺序表中，在第i个元素之前插入一个元素，需要移动元素的数量为（）',
    options: {
      A: 'n-i+1',
      B: 'n-i',
      C: 'i',
      D: 'i-1'
    },
    answer: 'B',
    explanation: '在第i个元素之前插入，需要移动第i个元素及其之后的所有元素，共n-i个。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '数据结构',
    type: 'single',
    content: '设栈的输入序列为1,2,3,4，则不可能的输出序列为（）',
    options: {
      A: '1,2,3,4',
      B: '4,3,2,1',
      C: '3,1,2,4',
      D: '2,1,4,3'
    },
    answer: 'C',
    explanation: '栈是先进后出的数据结构，3,1,2,4不可能由输入序列1,2,3,4通过栈操作得到。',
    difficulty: 2
  },
  {
    subject: '专业课',
    chapter: '数据结构',
    type: 'fill',
    content: '二叉树的前序遍历顺序是：______、左子树、右子树。',
    options: null,
    answer: '根节点',
    explanation: '二叉树前序遍历顺序：根节点 -> 左子树 -> 右子树。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '计算机网络',
    type: 'single',
    content: 'OSI参考模型中，负责路由选择功能的是（）',
    options: {
      A: '物理层',
      B: '数据链路层',
      C: '网络层',
      D: '传输层'
    },
    answer: 'C',
    explanation: '网络层的主要功能是路由选择和分组转发。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '计算机网络',
    type: 'multiple',
    content: 'TCP协议的特征包括（）',
    options: {
      A: '面向连接',
      B: '可靠传输',
      C: '面向报文',
      D: '流量控制'
    },
    answer: 'ABD',
    explanation: 'TCP是面向连接的可靠传输协议，具有流量控制和拥塞控制机制，而UDP才是面向报文的。',
    difficulty: 2
  },
  {
    subject: '专业课',
    chapter: '计算机网络',
    type: 'single',
    content: 'HTTP协议默认使用的端口号是（）',
    options: {
      A: '21',
      B: '22',
      C: '80',
      D: '443'
    },
    answer: 'C',
    explanation: 'HTTP协议默认使用80端口，HTTPS使用443端口。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '操作系统',
    type: 'single',
    content: '在操作系统中，进程的最基本特征是（）',
    options: {
      A: '动态性和并发性',
      B: '静态性和并发性',
      C: '动态性和同步性',
      D: '异步性和并发性'
    },
    answer: 'A',
    explanation: '进程的基本特征是动态性、并发性、独立性和异步性。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '操作系统',
    type: 'fill',
    content: '死锁产生的四个必要条件是：互斥条件、占有并等待条件、______条件和循环等待条件。',
    options: null,
    answer: '不可抢占',
    explanation: '死锁产生的四个必要条件是：互斥条件、占有并等待条件、不可抢占条件和循环等待条件。',
    difficulty: 2
  },
  {
    subject: '专业课',
    chapter: '操作系统',
    type: 'single',
    content: '进程和线程的主要区别是（）',
    options: {
      A: '进程是资源分配的基本单位，线程是CPU调度的基本单位',
      B: '线程是资源分配的基本单位，进程是CPU调度的基本单位',
      C: '进程和线程都是资源分配的基本单位',
      D: '进程和线程都是CPU调度的基本单位'
    },
    answer: 'A',
    explanation: '进程是操作系统资源分配的基本单位，而线程是CPU调度的基本单位。',
    difficulty: 2
  },
  // === 新增政治题目 ===
  {
    subject: '政治',
    chapter: '马克思主义基本原理',
    type: 'single',
    content: '唯物辩证法的实质和核心是（）',
    options: {
      A: '质量互变规律',
      B: '对立统一规律',
      C: '否定之否定规律',
      D: '因果规律'
    },
    answer: 'B',
    explanation: '对立统一规律是唯物辩证法的实质和核心，它揭示了事物发展的源泉和动力。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '马克思主义基本原理',
    type: 'single',
    content: '实践是认识的来源，这是因为（）',
    options: {
      A: '实践是认识的动力',
      B: '实践是检验认识真理性的唯一标准',
      C: '认识是在实践中产生的',
      D: '实践是认识的目的'
    },
    answer: 'C',
    explanation: '实践是认识的来源，认识是主体对客体的反映，这种反映只有在实践中才能完成。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '马克思主义基本原理',
    type: 'multiple',
    content: '下列属于实践基本形式的有（）',
    options: {
      A: '生产实践',
      B: '科学实验',
      C: '处理社会关系的实践',
      D: '思维活动'
    },
    answer: 'ABC',
    explanation: '实践的基本形式包括生产实践、处理社会关系的实践和科学实验。',
    difficulty: 2
  },
  {
    subject: '政治',
    chapter: '马克思主义基本原理',
    type: 'fill',
    content: '生产力的基本要素包括：劳动者、劳动资料和______。',
    options: null,
    answer: '劳动对象',
    explanation: '生产力的基本要素包括劳动者、劳动资料和劳动对象。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '毛泽东思想和中国特色社会主义理论体系',
    type: 'single',
    content: '中国共产党的根本宗旨是（）',
    options: {
      A: '实现共产主义',
      B: '全心全意为人民服务',
      C: '建设社会主义',
      D: '实现民族复兴'
    },
    answer: 'B',
    explanation: '全心全意为人民服务是中国共产党的根本宗旨。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '毛泽东思想和中国特色社会主义理论体系',
    type: 'single',
    content: '科学发展观的核心是（）',
    options: {
      A: '发展',
      B: '以人为本',
      C: '全面协调可持续',
      D: '统筹兼顾'
    },
    answer: 'B',
    explanation: '科学发展观的核心是以人为本，基本要求是全面协调可持续。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '毛泽东思想和中国特色社会主义理论体系',
    type: 'multiple',
    content: '社会主义核心价值体系包括（）',
    options: {
      A: '马克思主义指导思想',
      B: '中国特色社会主义共同理想',
      C: '以爱国主义为核心的民族精神',
      D: '社会主义荣辱观'
    },
    answer: 'ABCD',
    explanation: '社会主义核心价值体系包括马克思主义指导思想、中国特色社会主义共同理想、以爱国主义为核心的民族精神和以改革创新为核心的时代精神、社会主义荣辱观。',
    difficulty: 2
  },
  {
    subject: '政治',
    chapter: '中国近代史纲要',
    type: 'single',
    content: '标志着中国新民主主义革命开端的历史事件是（）',
    options: {
      A: '辛亥革命',
      B: '五四运动',
      C: '中国共产党成立',
      D: '南昌起义'
    },
    answer: 'B',
    explanation: '1919年的五四运动标志着中国新民主主义革命的开端。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '中国近代史纲要',
    type: 'single',
    content: '中国共产党成立的时间是（）',
    options: {
      A: '1920年',
      B: '1921年',
      C: '1922年',
      D: '1923年'
    },
    answer: 'B',
    explanation: '中国共产党成立于1921年7月23日。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '思想道德与法治',
    type: 'single',
    content: '我国公民道德建设的重点是（）',
    options: {
      A: '诚实守信',
      B: '爱岗敬业',
      C: '奉献社会',
      D: '服务群众'
    },
    answer: 'A',
    explanation: '诚实守信是我国公民道德建设的重点。',
    difficulty: 1
  },
  {
    subject: '政治',
    chapter: '思想道德与法治',
    type: 'multiple',
    content: '社会主义职业道德的基本要求包括（）',
    options: {
      A: '爱岗敬业',
      B: '诚实守信',
      C: '办事公道',
      D: '服务群众'
    },
    answer: 'ABCD',
    explanation: '社会主义职业道德的基本要求包括爱岗敬业、诚实守信、办事公道、服务群众和奉献社会。',
    difficulty: 2
  },
  // === 新增数学题目 ===
  {
    subject: '数学',
    chapter: '高等数学',
    type: 'single',
    content: '函数f(x)在x=a处连续是f(x)在x=a处可导的（）',
    options: {
      A: '充分条件',
      B: '必要条件',
      C: '充要条件',
      D: '无关条件'
    },
    answer: 'B',
    explanation: '可导必连续，但连续不一定可导，所以连续是可导的必要条件。',
    difficulty: 2
  },
  {
    subject: '数学',
    chapter: '高等数学',
    type: 'single',
    content: '设f(x)=x³-3x，则f(x)的极大值为（）',
    options: {
      A: '2',
      B: '-2',
      C: '1',
      D: '-1'
    },
    answer: 'A',
    explanation: 'f\'(x)=3x²-3=0，x=±1，f(-1)=2是极大值。',
    difficulty: 2
  },
  {
    subject: '数学',
    chapter: '高等数学',
    type: 'fill',
    content: '函数y=sinx的导数是______。',
    options: null,
    answer: 'cosx',
    explanation: '(sinx)\' = cosx',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '高等数学',
    type: 'single',
    content: '∫sinx dx = （）',
    options: {
      A: 'cosx + C',
      B: '-cosx + C',
      C: 'sinx + C',
      D: '-sinx + C'
    },
    answer: 'B',
    explanation: '∫sinx dx = -cosx + C',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '高等数学',
    type: 'single',
    content: '极限lim(x->0) sinx/x =（）',
    options: {
      A: '0',
      B: '1',
      C: '∞',
      D: '不存在'
    },
    answer: 'B',
    explanation: 'lim(x->0) sinx/x = 1，这是一个重要极限。',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '线性代数',
    type: 'single',
    content: '设A是n阶可逆矩阵，则下列说法正确的是（）',
    options: {
      A: '|A|=0',
      B: 'A的秩小于n',
      C: 'A可以表示为若干初等矩阵的乘积',
      D: 'A有零特征值'
    },
    answer: 'C',
    explanation: '可逆矩阵可以表示为若干初等矩阵的乘积。',
    difficulty: 2
  },
  {
    subject: '数学',
    chapter: '线性代数',
    type: 'fill',
    content: '若A是3阶矩阵，|A|=3，则|A⁻¹|=______。',
    options: null,
    answer: '1/3',
    explanation: '|A⁻¹| = 1/|A| = 1/3',
    difficulty: 2
  },
  {
    subject: '数学',
    chapter: '概率论与数理统计',
    type: 'single',
    content: '设X~B(n,p)，则E(X)=（）',
    options: {
      A: 'np',
      B: 'np(1-p)',
      C: 'p',
      D: 'n'
    },
    answer: 'A',
    explanation: '二项分布的数学期望E(X)=np。',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '概率论与数理统计',
    type: 'single',
    content: '设X~N(μ,σ²)，则Y=(X-μ)/σ服从（）',
    options: {
      A: 'N(0,1)',
      B: 'N(μ,σ²)',
      C: 'N(1,1)',
      D: 'N(0,σ²)'
    },
    answer: 'A',
    explanation: '标准化后Y服从标准正态分布N(0,1)。',
    difficulty: 1
  },
  {
    subject: '数学',
    chapter: '概率论与数理统计',
    type: 'fill',
    content: '若X与Y相互独立，则D(X+Y)=______。',
    options: null,
    answer: 'D(X)+D(Y)',
    explanation: '相互独立的随机变量，方差具有可加性。',
    difficulty: 2
  },
  // === 新增英语题目 ===
  {
    subject: '英语',
    chapter: '词汇与语法',
    type: 'single',
    content: 'I suggest that he ______ to see a doctor.',
    options: {
      A: 'go',
      B: 'goes',
      C: 'went',
      D: 'going'
    },
    answer: 'A',
    explanation: 'suggest后接虚拟语气，用(should)+动词原形。',
    difficulty: 1
  },
  {
    subject: '英语',
    chapter: '词汇与语法',
    type: 'single',
    content: 'The book is worth ______.',
    options: {
      A: 'read',
      B: 'reading',
      C: 'to read',
      D: 'to be read'
    },
    answer: 'B',
    explanation: 'worth后接动名词形式。',
    difficulty: 1
  },
  {
    subject: '英语',
    chapter: '词汇与语法',
    type: 'single',
    content: 'He insisted on ______ the work himself.',
    options: {
      A: 'do',
      B: 'doing',
      C: 'done',
      D: 'to do'
    },
    answer: 'B',
    explanation: 'insist on后接动名词形式。',
    difficulty: 1
  },
  {
    subject: '英语',
    chapter: '阅读理解',
    type: 'single',
    content: 'According to the context, "unprecedented" probably means ______.',
    options: {
      A: 'unexpected',
      B: 'never happened before',
      C: 'unimportant',
      D: 'unpredictable'
    },
    answer: 'B',
    explanation: 'unprecedented意为"史无前例的，空前的"，即从未发生过的。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '阅读理解',
    type: 'multiple',
    content: 'Which of the following can be inferred from the passage?',
    options: {
      A: 'The Internet has changed our way of communication.',
      B: 'Traditional media is completely replaced by digital media.',
      C: 'Social media has both positive and negative effects.',
      D: 'Online education is becoming increasingly popular.'
    },
    answer: 'ACD',
    explanation: '可以推断出互联网改变了我们的交流方式，社交媒体有正反两方面影响，在线教育越来越流行。但传统媒体并未被完全取代。',
    difficulty: 2
  },
  {
    subject: '英语',
    chapter: '完形填空',
    type: 'single',
    content: 'The weather was ______ cold that we stayed indoors all day.',
    options: {
      A: 'so',
      B: 'such',
      C: 'too',
      D: 'very'
    },
    answer: 'A',
    explanation: 'so...that...结构表示"如此...以至于..."。',
    difficulty: 1
  },
  {
    subject: '英语',
    chapter: '翻译',
    type: 'short',
    content: 'Translate the following sentence into English: "知识就是力量。"',
    options: null,
    answer: 'Knowledge is power.',
    explanation: '"知识就是力量"是培根的名言，英文翻译为"Knowledge is power."',
    difficulty: 1
  },
  // === 新增专业课题目 ===
  {
    subject: '专业课',
    chapter: '数据结构',
    type: 'single',
    content: '二叉树的中序遍历顺序是（）',
    options: {
      A: '根、左、右',
      B: '左、根、右',
      C: '左、右、根',
      D: '右、根、左'
    },
    answer: 'B',
    explanation: '二叉树中序遍历顺序是：左子树 -> 根节点 -> 右子树。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '数据结构',
    type: 'single',
    content: '用快速排序算法对序列进行升序排序，最坏情况下的时间复杂度是（）',
    options: {
      A: 'O(n)',
      B: 'O(nlogn)',
      C: 'O(n²)',
      D: 'O(logn)'
    },
    answer: 'C',
    explanation: '快速排序最坏情况下的时间复杂度是O(n²)，发生在序列已经有序的情况下。',
    difficulty: 2
  },
  {
    subject: '专业课',
    chapter: '数据结构',
    type: 'fill',
    content: '在一个具有n个顶点的无向完全图中，边的数目为______。',
    options: null,
    answer: 'n(n-1)/2',
    explanation: '无向完全图中，每个顶点与其他n-1个顶点都有边相连，共有n(n-1)/2条边。',
    difficulty: 2
  },
  {
    subject: '专业课',
    chapter: '计算机网络',
    type: 'single',
    content: 'TCP三次握手的目的是（）',
    options: {
      A: '确认双方的收发能力',
      B: '协商数据传输速率',
      C: '同步双方的时钟',
      D: '交换加密密钥'
    },
    answer: 'A',
    explanation: 'TCP三次握手的目的是确认双方的收发能力，建立可靠连接。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '计算机网络',
    type: 'single',
    content: 'IP地址192.168.1.1属于（）',
    options: {
      A: 'A类地址',
      B: 'B类地址',
      C: 'C类地址',
      D: 'D类地址'
    },
    answer: 'C',
    explanation: '192开头的IP地址属于C类地址。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '计算机网络',
    type: 'fill',
    content: 'DNS的作用是将______转换为IP地址。',
    options: null,
    answer: '域名',
    explanation: 'DNS（域名系统）的作用是将域名转换为IP地址。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '操作系统',
    type: 'single',
    content: '下列哪种页面置换算法可能产生Belady异常（）',
    options: {
      A: 'FIFO',
      B: 'LRU',
      C: 'OPT',
      D: 'LFU'
    },
    answer: 'A',
    explanation: 'FIFO页面置换算法可能产生Belady异常，即分配的页框数增加时缺页次数反而增加。',
    difficulty: 2
  },
  {
    subject: '专业课',
    chapter: '操作系统',
    type: 'single',
    content: '进程从运行态到阻塞态的转换是由（）引起的',
    options: {
      A: '进程调度',
      B: '时间片用完',
      C: '等待某一事件',
      D: '等待的事件发生'
    },
    answer: 'C',
    explanation: '进程因等待某一事件（如I/O操作）而从运行态转换为阻塞态。',
    difficulty: 2
  },
  {
    subject: '专业课',
    chapter: '操作系统',
    type: 'multiple',
    content: '下列属于进程调度算法的有（）',
    options: {
      A: '先来先服务（FCFS）',
      B: '短作业优先（SJF）',
      C: '时间片轮转（RR）',
      D: '最近最少使用（LRU）'
    },
    answer: 'ABC',
    explanation: 'FCFS、SJF、RR都是进程调度算法，而LRU是页面置换算法。',
    difficulty: 2
  },
  {
    subject: '专业课',
    chapter: '数据库原理',
    type: 'single',
    content: '在关系数据库中，实现数据之间联系的方法是（）',
    options: {
      A: '索引',
      B: '指针',
      C: '公共属性',
      D: '嵌套'
    },
    answer: 'C',
    explanation: '在关系数据库中，通过公共属性（外键）来实现表之间的联系。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '数据库原理',
    type: 'single',
    content: 'SQL语句中，用于查询数据的关键字是（）',
    options: {
      A: 'INSERT',
      B: 'UPDATE',
      C: 'SELECT',
      D: 'DELETE'
    },
    answer: 'C',
    explanation: 'SELECT是SQL中用于查询数据的关键字。',
    difficulty: 1
  },
  {
    subject: '专业课',
    chapter: '数据库原理',
    type: 'fill',
    content: '关系数据库中，数据的最小单位是______。',
    options: null,
    answer: '属性',
    explanation: '关系数据库中，数据的最小单位是属性（字段）。',
    difficulty: 1
  }
];

async function seed() {
  console.log('开始初始化数据库...');

  await initDb();

  const existingQuestions = Question.findAll();
  let importedCount = 0;
  
  for (const q of seedQuestions) {
    const exists = existingQuestions.some(
      eq => eq.content === q.content && eq.subject === q.subject
    );
    if (!exists) {
      Question.create(q);
      importedCount++;
    }
  }
  
  if (importedCount > 0) {
    console.log(`成功导入${importedCount}道新题目`);
  } else {
    console.log('所有题目已存在于数据库中');
  }

  const testUser = User.findByUsername('cxy');
  if (!testUser) {
    User.create('cxy', '2387472358@qq.com', 'cxy20050915');
    console.log('已创建测试用户: cxy');
  } else {
    console.log('测试用户已存在');
  }

  console.log('数据库初始化完成!');
}

seed().then(() => process.exit(0)).catch(err => {
  console.error('导入失败:', err);
  process.exit(1);
});
