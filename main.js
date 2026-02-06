'use strict';
import { lib, game, ui, get, ai, _status } from "../../noname.js";
import { hyyzBuffx } from "./hyyzBuff.js";

async function ARENAREADY() { }
async function PREPARE() { }
/** @type { importCharacterConfig['skill'] } */
async function PRECONTENT() {
	//——————————————军八座位次上限——————————————//
	_status.maximumNumberOfPlayers ??= 30


	//——————————————忽悠宇宙特有存储空间——————————————//
	lib.hyyz ??= {}
	Object.assign(lib.hyyz, {
		authors: {
			hyyzSort_lige: '紫灵谷的骊歌',
			hyyzSort_huohuoTail: '尾巴酱',
			hyyzSort_canghaiyisu: '沧海依酥',
			hyyzSort_menghai: '梦海离殇',
			hyyzSort_miealiei: '咩阿栗诶',
			hyyzSort_youyi: '柚衣',
			hyyzSort_xiao: '魈',
			hyyzSort_fushengyi: '浮生亦',
			hyyzSort_lalalala: '啦啦啦啦',
			hyyzSort_rijiu: '日玖阳气冲三关',
			hyyzSort_xilin: '西琳',
			hyyzSort_weiyu: '微雨',
			hyyzSort_miao: '埋埋埋埋喵',
			hyyzSort_lengruohan: '冷若寒',
			hyyzSort_xinzhi: '心之所向_星之所向',
			hyyzSort_mushancai: '木善才',
			hyyzSort_zhouwang: '纣王',
			hyyzSort_yuezhou: '樾舟',
			//无自设
			hyyzSort_feisesu: '绯色愫',
			hyyzSort_shiyi: '拾壹',
			hyyzSort_muci: '慕辞',
			hyyzSort_liuying: '流萤一生推',
			hyyzSort_qixiyue: '七夕月',
			hyyzSort_sabalujiang: '萨巴鲁酱',
			hyyzSort_zuoyeliuying: '昨夜流萤',
			hyyzSort_qianqiuwanye: '千秋万叶',
			hyyzSort_huangliangjiu: '黄粱酒温梦',
			hyyzSort_yishuizhian: '奕水之安',
			hyyzSort_zhushang: '一般路过の祝商',
			hyyzSort_huidanglingjueding: '会当凌绝顶喵',
			hyyzSort_yayiyuanfei: '鸦懿鸢霏',
			hyyzSort_wuleizhengxin: '五雷正心',
			hyyzSort_dengjie: '灯姐',
			hyyzSort_sanqiu: '三秋',
			hyyzSort_luoyeqiushuang: '落叶秋霜',
		},
		prefix: {
			//hyyz_b3: '崩',
			hyyz_b3_sp: 'SP',
			hyyz_b3_re: '界',
			hyyz_b3_sb: '谋',
			hyyz_b3_wu: '武',
			//hyyz_ys: '原',
			hyyz_ys_sp: 'SP',
			hyyz_ys_re: '界',
			hyyz_ys_sb: '谋',
			hyyz_ys_wu: '武',
			hyyz_ys_shen: '神',
			//hyyz_xt: '铁',
			hyyz_xt_re: '界',
			hyyz_xt_wo: '我',
			hyyz_xt_sp: 'SP',
			hyyz_xt_sb: '谋',
			hyyz_xt_wu: '武',
			hyyz_xt_shen: '神',
			//hyyz_zzz: '绝',
			hyyz_zzz_sb: '谋',
			hyyz_ɸ: 'ɸ',
			hyyz_ɸ_chunjin: 'ɸ纯烬',
			ym: '梦',
			ym_re: '梦界',
			ym_sp: '梦SP',
		},
		//所有武将
		characters: {},
		//注释
		get introduce() {
			const introduce = {
				生息: "特有概念：buff，加2点体力上限，下次受到伤害后，回复1点体力。失去此效果的回合结束后，减2点体力上限。",
				//属性
				风蚀: `特有概念：一名角色受到风蚀伤害时，弃置至少一张牌；每额外弃置两张牌，此伤害减少1点。`,
				量子: `特有概念：一名角色使用量子【杀】指定目标后，可以重铸一张牌，然后目标角色随机重铸一张同类型的牌。`,
				虚数: `特有概念：一名角色受到虚数伤害时/使用虚数【杀】指定目标后，受伤角色/目标角色本回合护甲和防具失效。`,
				//buff
				效果: "特有概念：分为增益[效果]-buff和负面[效果]-debuff，其中debuff包含持续[效果]-dotdebuff。<li>净化：移除对象判定区的牌、复原武将牌、移除所有debuff、熄灭[点燃]的牌。<li>驱散：移除所有buff。<li>引爆：立即结算dotdebuff中的高亮效果。",
				净化: "特有概念：移除对象判定区的牌、复原武将牌、移除所有debuff、熄灭[点燃]的牌。",
				驱散: "特有概念：移除对象所有buff。",
				引爆: "特有概念：立即结算对象拥有的dotdebuff中的高亮效果。",
				//buff
				加速: "特有概念：buff，下个弃牌阶段开始前，插入一个出牌阶段。",
				//debuff
				重伤: "特有概念：debuff，下次受到的伤害+1。",
				虚弱: "特有概念：debuff，下次造成的伤害-1。",
				减速: "特有概念：debuff，下个出牌阶段开始前，插入一个弃牌阶段。",
				冻结: "特有概念：debuff，当前回合内不能使用、打出或弃置手牌。",
				禁锢: "特有概念：debuff，使用的下一张牌无效。",
				纠缠: "特有概念：debuff，下次成为即时牌的目标后，重铸一张相同类型的牌，否则此牌结算两次。",
				//dotdebuff
				裂伤: "特有概念：dotdebuff，每层令此角色使用牌指定其他角色后失去1点体力。",
				灼烧: "特有概念：dotdebuff，每层令此角色[点燃]区域内随机两张牌（优先手牌）",
				风化: "特有概念：dotdebuff，准备阶段，每层使此角色受到1点风蚀伤害。",
				触电: "特有概念：dotdebuff，始终横置；每层使此角色使用或打出无目标的牌后受到1点雷电伤害",
				//弱点
				弱点: "特有概念：弱点击破后会触发对应的击破debuff，受到非dotdeubff伤害将被击破弱点。",

				//宝集
				中央区: "封装概念：本回合进入弃牌堆的牌。",
				即时牌: "封装概念：基本牌和普通锦囊牌；装备牌和延时锦囊牌称为非即时牌。",
				周始: "封装概念：转换技或多选项技能完成一轮循环后触发的效果。",
				附魔: "封装概念：为一项事物增加额外效果。<li>属性：新增该附魔词条。<li>牌：牌生效后，执行该附魔词条中的效果。<li>技能或效果：令附魔对象的拥有者/使用者在结算中视为拥有附魔词条中包含的技能或效果。",
				滞留牌: '封装概念：此刻没有合法目标的手牌（即不能点击的手牌）。',
				点燃: "封装概念：被点燃的牌使用时无距离和次数限制且不计入次数上限；每回合结束后弃置之。",
				断拒: "特有概念：背水的反面，不执行任何选项，直接执行后面的效果。<li>可视为一个空白无效果的按钮。",
				背水: "官方概念：断拒的反面，依次执行前面所有选项！<li>技能中存在多个选项或分支时，执行背水的效果后，再依次执行所有选项的内容。若不能支付代价，无法选择背水选项。",
				单挑: '特有概念：与一名角色进入其他存活角色离场的单挑模式，默认持续至当前回合结束。',
				追加攻击: '特有概念：一名角色于回合外，或非牌造成的伤害。',
				法则技: '封装概念：本局游戏，所有角色均视为拥有的技能。<li>你死亡后此技能依然存在。',
				否极技: '封装概念：转换技与选项的变种。拥有多个选项，但每个选项只能选择一次。所有选项均选择过后，触发“泰来”：重置所有选项并执行后面的效果。<li>选项形式很多样，如：装备区之于各个装备栏、所有角色之于各个角色，也存在角色与选项绑定的情况：薪炎之律者。',
				异常: '特有概念：指有扩展的装备栏或废除的装备栏。通常伴有“初始化装备栏”，指恢复成通常情况的五个标准装备栏。',
			}
			for (let i in introduce) introduce[i] = '<li>' + introduce[i];
			return introduce;
		}
	})
	if ('新增前缀') {
		lib.namePrefix.set('ɸ', { color: '#fd8359', nature: 'soilmm', showName: "ɸ" });//武
		lib.namePrefix.set('ɸ纯烬', { color: '#fd8359', nature: 'soilmm', showName: "ɸ纯烬" });//武
		lib.namePrefix.set('我', { color: '#1bdeb4', nature: 'soilmm', showName: "我" });//自定义
		lib.namePrefix.set('梦界', { getSpan: () => `${get.prefixSpan("梦")}${get.prefixSpan("界")}` });
		lib.namePrefix.set('梦SP', { getSpan: () => `${get.prefixSpan("梦")}${get.prefixSpan("SP")}` });
	}
	//——————————————导入CSS文件——————————————//
	lib.init.css(`${lib.assetURL}extension/忽悠宇宙/other`, `extension`);
	if ('势力与新属性') {
		//——————————————势力添加——————————————//
		game.addGroup('hyyz_ys', '<span class="hyyzGroup">原</span>', '原神', {
			color: 'water',
			image: 'ext:忽悠宇宙/other/qhly/hyyz_ys.png'
		});
		game.addGroup('hyyz_xt', `<span class="hyyzGroup">铁</span>`, '星铁', {
			color: 'white',
			image: 'ext:忽悠宇宙/other/qhly/hyyz_xt.png'
		});
		game.addGroup('hyyz_b3', '<span class="hyyzGroup">崩</span>', '崩三', {
			color: 'thunder',
			image: 'ext:忽悠宇宙/other/qhly/hyyz_b3.png'
		});
		game.addGroup('hyyz_zzz', '<span class="hyyzGroup">绝</span>', '绝区零', {
			color: 'black',
			image: 'ext:忽悠宇宙/other/qhly/hyyz_zzz.png'
		});
		game.addGroup('hyyz_ɸ', '<span class="hyyzGroup">梦</span>', '圆梦', {
			color: '#ee9ac7',
			image: 'ext:忽悠宇宙/other/qhly/hyyz_ɸ.png'
		});

		//——————————————新属性——————————————//
		game.addNature('hyyz_water', '水熵', {
			audio: {
				damage: {
					hyyz_water: {
						1: '../extension/忽悠宇宙/other/audio/damage_hyyz_water.mp3',
						2: '../extension/忽悠宇宙/other/audio/damage_hyyz_water2.mp3',
					}
				},
				hujia_damage: {
					hyyz_water: {
						1: '../extension/忽悠宇宙/other/audio/hujia_damage_hyyz_water.mp3',
						2: '../extension/忽悠宇宙/other/audio/hujia_damage_hyyz_water2.mp3',
					}
				}
			},
			linked: true,
			order: 10,
			background: 'extension/忽悠宇宙/asset/card/image/hyyz_water.png',
			lineColor: [0, 100, 200],
			color: [0, 100, 200],
		});
		lib.translate.hyyz_water = '水'
		lib.skill._hyyz_water = {
			trigger: {
				player: "damageBegin3"
			},
			forced: true,
			priority: -Infinity,
			popup: false,
			filter(event, player) {
				if (!event.hasNature('hyyz_water')) return false;
				return event.source?.getSeatNum() != undefined && player.countCards('e') > 0;
			},
			async content(event, trigger, player) {
				let card;
				for (let i of [5, 4, 3, 2, 1]) {
					const cards = player.getEquips('equip' + i)
					if (cards.length > 0) {
						card = cards[0]
						break;
					}
				}
				if (!card || get.itemtype(card) != 'card') return;
				/**来源的座次 */
				const source = trigger.source;
				/**总人数 */
				const MAX = game.players.concat(game.dead).length;
				/**两名角色之间的间隔 */
				const length = function (player, target) {
					const x = Math.abs(player.getSeatNum() - target.getSeatNum());
					return x > MAX / 2 ? MAX - x : x;
				}
				let target;
				if (length(source, player.next) > length(source, player.previous)) {
					target = player.next;
				} else if (length(source, player.next) < length(source, player.previous)) {
					target = player.previous;
				}
				if (target?.isIn() && target.hasEmptySlot(get.subtype(card))) {
					game.log('#g「水熵」', player, '的', card, '随波逐流了');
					await target.equip(card);
					player.$give(card, target);
					player.line(target, "hyyz_water");
				} else {
					game.log('#g「水熵」', player, '的', card, '随流水逝去');
					source.line(player, 'hyyz_water')
					await player.discard(card).set('discarder', source)
				}
			},
		};
		game.addNature('fire', '火焰', {
			//audio: 'default',
			linked: true,
			order: 20,
			background: 'extension/忽悠宇宙/asset/card/image/fire.png',
			lineColor: [255, 0, 0],
			color: [255, 0, 0],
		});
		game.addNature('thunder', '雷电', {
			//audio: 'default',
			linked: true,
			order: 30,
			background: 'extension/忽悠宇宙/asset/card/image/thunder.png',
			lineColor: [180, 0, 180],
			color: [180, 0, 180],
		});
		game.addNature('ice', '冰冻', {
			//audio: 'default',
			linked: true,
			order: 40,
			background: 'extension/忽悠宇宙/asset/card/image/ice.png',
			lineColor: [70, 170, 170],
			color: [70, 170, 170],
		});
		game.addNature('hyyz_wind', '风蚀', {
			audio: {
				damage: {
					hyyz_wind: {
						1: '../extension/忽悠宇宙/other/audio/damage_hyyz_wind.mp3',
						2: '../extension/忽悠宇宙/other/audio/damage_hyyz_wind2.mp3',
					}
				},
				hujia_damage: {
					hyyz_wind: {
						1: '../extension/忽悠宇宙/other/audio/hujia_damage_hyyz_wind.mp3',
						2: '../extension/忽悠宇宙/other/audio/hujia_damage_hyyz_wind2.mp3',
					}
				}
			},
			linked: true,
			order: 70,
			background: 'extension/忽悠宇宙/asset/card/image/hyyz_wind.png',
			lineColor: [80, 220, 220],
			color: [80, 220, 220],
		});
		lib.skill._hyyz_wind = {
			trigger: {
				player: "damageBegin3"
			},
			silent: true,
			priority: -Infinity,
			filter(event, player) {
				return player.countCards('he') > 0 && event.hasNature('hyyz_wind');
			},
			async content(event, trigger, player) {
				const { cards } = await player
					.chooseToDiscard(`风蚀`, `弃置至少一张牌；每多弃置两张，防止1点伤害`, 'he', [1, trigger.num * 2 + 1], true)
					.set('ai', function (card) {
						const trigger = _status.event.getTrigger(), player = _status.event.player;
						if (
							player.countCards('he') - 3 >= trigger.num * 2 + 1 ||
							player.countCards('he') >= trigger.num * 2 + 1 && trigger.num > player.hp
						) {
							return true;//致命，牌多
						};
						let cards = player.getCards('he').sort((a, b) => get.value(a) - get.value(b));
						let discards = [cards.shift()];
						while (discards.reduce((a, b) => a + get.value(b), 0) / discards.length <= 8 && cards.length >= 2) {
							//game.log(discards, '的平均收益：', discards.reduce((a, b) => a + get.value(b), 0) / discards.length, '<li>其他牌为', cards)
							discards.add(cards.shift());
							discards.add(cards.shift());
						};
						return discards.includes(card);
					})
					.forResult();
				if (cards) {
					var count = Math.floor((cards.length - 1) / 2);
					if (count > 0) {
						game.log('#g「风蚀」', player, '减少了', count, '点风蚀伤害');
						if (trigger.num > 0) trigger.num -= count;
					}
				}
			}
		}
		game.addNature('hyyz_quantum', '量子', {
			audio: {
				damage: {
					hyyz_quantum: {
						1: '../extension/忽悠宇宙/other/audio/damage_hyyz_quantum.mp3',
						2: '../extension/忽悠宇宙/other/audio/damage_hyyz_quantum2.mp3',
					}
				},
				hujia_damage: {
					hyyz_quantum: {
						1: '../extension/忽悠宇宙/other/audio/hujia_damage_hyyz_quantum.mp3',
						2: '../extension/忽悠宇宙/other/audio/hujia_damage_hyyz_quantum2.mp3',
					}
				}
			},
			linked: true,
			order: 80,
			background: 'extension/忽悠宇宙/asset/card/image/hyyz_quantum.png',
			lineColor: [80, 0, 180],
			color: [80, 0, 180],
		});
		lib.skill._hyyz_quantum = {
			trigger: {
				player: "useCardToPlayered"
			},
			forced: true,
			priority: -Infinity,
			popup: false,
			filter(event, player) {
				return player.countCards('he', (card) => player.canRecast(card)) && get.name(event.card) == 'sha' && game.hasNature(event.card, 'hyyz_quantum');
			},
			async content(event, trigger, player) {
				const { cards } = await player.chooseCard(`纠缠`, `你可以重铸一张牌，${get.translation(trigger.target)}将随机重铸一张同类型的牌`, 'he', function (card) {
					return _status.event.player.canRecast(card);
				})
					.set('ai', (card) => 8 - get.value(card))
					.forResult();
				if (cards) {
					await player.recast(cards);
					const loses = trigger.target.getCards('he', card => get.type2(card) == get.type2(cards[0]));
					if (loses.length) {
						trigger.target.recast(loses.randomGet());
						game.log('#g「量子」', trigger.target, '被', player, '纠缠了');
					} else {
						game.log('#g「量子」', player, '自我纠缠ing');
					}

				};
			},
		}
		game.addNature('hyyz_imaginary', '虚数', {
			audio: {
				damage: {
					hyyz_imaginary: {
						1: '../extension/忽悠宇宙/other/audio/damage_hyyz_imaginary.mp3',
						2: '../extension/忽悠宇宙/other/audio/damage_hyyz_imaginary2.mp3',
					}
				}
			},
			linked: true,
			order: 90,
			background: 'extension/忽悠宇宙/asset/card/image/hyyz_imaginary.png',
			lineColor: [255, 255, 0],
			color: [255, 255, 0],
		});
		lib.skill._hyyz_imaginary = {
			trigger: {
				player: ["damageBegin3", "useCardToPlayered"],
			},
			forced: true,
			priority: -Infinity,
			popup: false,
			filter(event, player) {
				if (event.name == 'damage') {
					return !player.hasSkill('hyyz_imaginary_buff') && event.hasNature('hyyz_imaginary')
				} else {
					return event.targets.some(current => !current.hasSkill('hyyz_imaginary_buff')) && game.hasNature(event.card, "hyyz_imaginary");
				}
			},
			async content(event, trigger, player) {
				if (trigger.name == 'damage') {
					player.addTempSkill('hyyz_imaginary_buff');
					player.markSkill('hyyz_imaginary_buff');
					game.log('#g「虚数」', player, '本回合护甲和防具失效');
				} else {
					game.log('#g「虚数」', trigger.targets, '本回合护甲和防具失效');
					trigger.targets.forEach(current => {
						if (!current.hasSkill('hyyz_imaginary_buff')) {
							current.addTempSkill('hyyz_imaginary_buff');
							current.markSkill('hyyz_imaginary_buff');
						}
					})
				}
			},
		}
		lib.skill.hyyz_imaginary_buff = {
			charlotte: true,
			superCharlotte: true,
			unique: true,
			mark: true,
			marktext: '※',
			intro: {
				name: '虚数',
				content: '本回合防具和护甲失效'
			},
			ai: {
				nohujia: true,
				"unequip2": true,
			},
		}
	}

	//——————————————卡牌——————————————//
	lib.skill._hyyz_heiyuanbaihua = {//黑渊白花合成机制
		trigger: {
			player: "equipAfter",
		},
		filter(event, player) {
			if (lib.inpile.includes('hyyz_heiyuanbaihua')) return false;

			let names = ['hyyz_baihua', 'hyyz_heiyuan'];
			if (!event.cards.some(card => names.includes(card.name)) || !player.getCards('e', card => names.includes(card.name))) return false;
			names.remove(event.cards.find(card => names.includes(card.name)).name);
			return event.getl && event.getl(player).es?.some(card => card.name == names[0]);
		},
		priority: Infinity,
		silent: true,
		async content(event, trigger, player) {
			let names = ['hyyz_baihua', 'hyyz_heiyuan'];
			const before = trigger.getl(player).es.find(card => names.includes(card.name));
			if (before.fix) before.fix();
			if (before.remove) before.remove();
			if (!before.destroyed) before.destroyed = true;
			lib.inpile.remove(before.name);
			names.remove(before.name);

			const after = trigger.cards.find(card => names[0] == card.name);
			await player.lose([after], ui.special);
			if (after.fix) after.fix();
			if (after.remove) after.remove();
			if (!after.destroyed) after.destroyed = true;
			lib.inpile.remove(after.name);

			game.log(before, '和', after, '合为', '#y黑渊白花【♣12】');
			const card = game.createCard2('hyyz_heiyuanbaihua', 'club', 12);
			player.equip(card);
			lib.inpile.add('hyyz_heiyuanbaihua');
		}
	}
	/**玩家显示智库的x张牌 */
	lib.element.player.zhiku_shown = function (count = 1) {
		lib.translate.zhiku = '智库';
		const player = this;
		let cards = Array.from(ui.cardPile.childNodes).slice(0, count);
		let gainCards = cards.map((card) => {
			let cardx = ui.create.card()
			cardx.init(get.cardInfo(card));
			cardx._cardid = card.cardid;
			return cardx;
		});
		player.directgains(gainCards, null, "zhiku");
		const observer = new MutationObserver((mutLists, observer) => {
			for (const mutList of mutLists) {
				if (mutList.type === 'childList') {
					let cards = Array.from(ui.cardPile.childNodes).slice(0, count);
					let gainCards = cards.map((card) => {
						let cardx = ui.create.card().init(get.cardInfo(card));
						cardx._cardid = card.cardid;
						return cardx;
					});
					let deleteCards = player.getCards('s', card => card.hasGaintag('zhiku'));
					if (player.isOnline2()) {
						player.send(function (cards, player) {
							cards.forEach(i => i.delete());
							if (player == game.me) ui.updatehl();
						}, deleteCards, player);
					}
					deleteCards.forEach(card => card.delete());
					player.directgains(gainCards, null, "zhiku");
					if (player == game.me) ui.updatehl();
				}
			}
		});
		return observer;
	}
	/**失去虚空万藏 */
	lib.skill._xukongwanzang = {
		trigger: {
			player: ["loseBegin"]
		},
		silent: true,
		forced: true,
		forceDie: true,
		filter(event, player) {
			return event.cards.some(card => card.name.includes("hyyz_xvkong"));
		},
		async content(event, trigger, player) {
			if (player.storage.zhiku_shown) {
				player.storage.zhiku_shown.disconnect(ui.cardPile, { childList: true, subtree: true });
				delete player.storage.zhiku_shown;
			}
			player.getCards('s', card => card.hasGaintag('zhiku')).forEach(i => i.delete());
		},
		//不准使用！
		mod: {
			cardEnabled2(card, player, bool) {
				if (get.itemtype(card) == 'card' && (card.gaintag?.includes('zhiku'))) return false;
			},
		},
	};

	//——————————————十周年卡牌美化——————————————//
	if (lib.config.extensions?.includes('十周年UI') && lib.config['extension_十周年UI_enable'] == true) {
		game.getFileList('extension/十周年UI/image/card-skins/caise', (folders, files) => {
			[
				'hyyz_chuochuo.webp', 'hyyz_lingfu.webp', 'hyyz_zisu.webp',
				//神之键
				'hyyz_xvkong.webp', 'hyyz_qianjie.webp', 'hyyz_dizui.webp', 'hyyz_weixing.webp', 'hyyz_wanwu.webp', 'hyyz_heiyuan.webp', 'hyyz_baihua.webp', 'hyyz_heiyuanbaihua.webp', 'hyyz_tianhuo1.webp', 'hyyz_tianhuo2.webp', 'hyyz_tianhuo3.webp', 'hyyz_yvdu.webp', 'hyyz_bushi.webp', 'hyyz_xinghai.webp', 'hyyz_xuanyuan.webp', 'hyyz_taixv.webp', 'hyyz_youda.webp', 'hyyz_dizang.webp', 'hyyz_weiba.webp', 'hyyz_zhili.webp',

				'hyyz_qiongguan.webp', 'hyyz_mengxiangyixin.webp', 'hyyz_jiwang.webp',
				//杀
				'sha_hyyz_fire.webp', 'sha_hyyz_wind.webp', 'sha_hyyz_ice.webp', 'sha_hyyz_water.webp',
				'sha_hyyz_imaginary.webp', 'sha_hyyz_quantum.webp', 'sha_hyyz_thunder.webp', 'sha.webp',
			].forEach((cardName) => {
				if (!files.includes(cardName)) {
					game.readFile('extension/忽悠宇宙/other/tenth/' + cardName, (data) => {
						game.writeFile(data, 'extension/十周年UI/image/card-skins/caise', cardName, () => { });
					}, (err) => console.error(err));
				}
			})
		})
		game.getFileList('extension/十周年UI/image/styles/decade', (folders, files) => {
			['name_hyyz_b3.png', 'name_hyyz_ɸ.png', 'name_hyyz_ys.png', 'name_hyyz_xt.png', 'name_hyyz_zzz.png'].forEach((groupName) => {
				if (!files.includes(groupName)) {
					game.readFile('extension/忽悠宇宙/other/tenth/' + groupName, (data) => {
						game.writeFile(data, 'extension/十周年UI/image/styles/decade', groupName, () => { });
					}, (err) => console.error(err));
				}
			})
		})
	}



	//——————————————详情介绍——————————————//
	/**感谢钫酸酱、沐如风晨-创造一个窗口用于显示
	 * - 只是{@link hyyzIntroduce}的狗而已
	 * @param {string} str 被显示的字符串
	 * @param {number}id 被显示窗口的标号
	 */
	get.hyyztips = function (str, id) {
		const hyyztip = ui.create.div('.hyyz-tip', document.body);
		let isPhone = /mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent);
		hyyztip.style.zIndex = 998;
		const hyyztip2 = ui.create.div('.hyyz-tip2', hyyztip);
		hyyztip2.innerHTML = str;
		let element = document.getElementById(id);
		if (element) {
			let left = element.getBoundingClientRect().left;
			if (isPhone) left += element.offsetParent.offsetLeft;
			left += document.body.offsetWidth * 0.14;
			hyyztip2.style.left = left + 'px';

			let top = element.getBoundingClientRect().top;
			top += document.body.offsetHeight * 0.08;
			hyyztip2.style.top = top + 'px';
		}
		hyyztip.listen(function (e) {
			e.stopPropagation();
			this.remove();
		})
	}
	/**弹窗显示注释
	 * 返回的字符串有超链接效果
	 * @param {string} key 被解释的关键词
	 * @param {string} str 解释的内容
	 * @returns {string}
	 */
	get.hyyzIntroduce = function (key, str) {
		let link = `<u><b>[`
		const id = (Math.random() * 9 + 1) * 100000;//随机id，并不稳定，但是基本没有bug//建议改为固定规则的编码
		if (str && str != '') {
			link += `<a id='${id}' style = 'color: unset' href = "javascript: get.hyyztips('${str}', '${id}'); ">${key}</a>`;
		} else if (lib.hyyz.introduce[key]) {
			link += `<a id='${id}' style = 'color: unset' href = "javascript: get.hyyztips('${lib.hyyz.introduce[key]}', '${id}'); ">${key}</a>`;
		} else link += '锟斤拷';
		link += `]</b></u>`;
		return link;
	}

	//——————————————导入特殊机制——————————————//
	hyyzBuffx();
	import('./asset/index.js')
}
async function CONTENT(config, pack) {
	if ('强度评级') {
		//sss传说，极致的强度
		lib.rank.rarity['legend'].addArray([
			'hyyz_xt_ren', 'hyyz_b3_hua', 'hyyz_b3_re_zhongyanzhilvzhe', 'hyyz_xt_sb_kafuka', 'hyyz_ys_wu_xiaogong', 'hyyz_b3_re_xinyanzhilvzhe', 'hyyz_b3_paduo', 'hyyz_xt_lingke', 'hyyz_xt_wu_liuying', 'hyyz_xt_liuying', 'hyyz_ɸ_mansui', 'hyyz_zzz_xingjianya', 'hyyz_xt_sb_shajin', 'hyyz_xt_sp_zhigengniao', 'hyyz_xt_yvkong', 'hyyz_zzz_sb_bonisi', 'hyyz_ɸ_huyouyvzhou', 'hyyz_ɸ_huyouzongzu', 'ym_yanfeng', 'ym_lengruohan', 'ym_zhouwang', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
		])
		//ss史诗，均衡强，或偶尔极致
		lib.rank.rarity['epic'].addArray([
			'hyyz_xt_jingyuan', 'hyyz_xt_welt', 'hyyz_xt_yinlang', 'hyyz_xt_jizi', 'hyyz_xt_sp_sushang', 'hyyz_xt_bronya', 'hyyz_xt_sushang', 'hyyz_xt_kelala', 'hyyz_b3_sp_xier', 'hyyz_b3_kiana', 'hyyz_b3_sb_jiziwuliangta', 'hyyz_xt_danhengyinyue', 'hyyz_b3_sp_jiziwuliangta', 'hyyz_ys_shenlilingren', 'hyyz_b3_sushang', 'hyyz_ys_shenlilinghua', 'hyyz_ys_nuoaier', 'hyyz_xt_huohuo', 'hyyz_ys_sp_wendy', 'hyyz_ys_abeiduo', 'hyyz_ɸ_zhaoxing', 'hyyz_xt_aisida', 'hyyz_xt_ruanmei', 'hyyz_xt_yinzhi', 'hyyz_b3_aiyi', 'hyyz_xt_sp_jingyuan', 'hyyz_xt_guinaifen', 'hyyz_ys_zhongli', 'hyyz_xt_zhenliyisheng', 'hyyz_b3_jiziwuliangta', 'hyyz_xt_sp_huohuo', 'hyyz_ɸ_pink', 'hyyz_xt_wangxiayitong', 'hyyz_xt_sb_jingliu', 'hyyz_b3_ailixiya', 'hyyz_b3_geleixiu', 'hyyz_b3_wu_hua', 'hyyz_b3_sp_kaiwen', 'hyyz_b3_qianjie', 'hyyz_b3_su', 'hyyz_b3_shiyuanzhilvzhe', 'hyyz_b3_yidian', 'hyyz_ɸ_luotianyi', 'hyyz_xt_huangquan', 'hyyz_xt_botiou', 'hyyz_xt_fuxuan', 'hyyz_b3_leidianyayi', 'hyyz_ys_sb_zhongli', 'hyyz_ɸ_quancong', 'hyyz_ys_fukaluosi', 'hyyz_xt_sb_fuxuan', 'hyyz_xt_luanpo', 'hyyz_b3_sp_hua', 'hyyz_b3_weierwei', 'hyyz_ɸ_dinyi', 'hyyz_b3_sp_qingque', 'hyyz_ɸ_king', 'hyyz_ɸ_peiyuanshao', 'hyyz_xt_tibao', 'hyyz_ɸ_caiwenji', 'hyyz_xt_shen_nikaduoli', 'hyyz_ys_sikeke', 'hyyz_b3_re_hua', 'ym_zilinggudelige', 'ym_weibajiang', 'ym_canghaiyisu', 'ym_miealiei', 'ym_fushengyi', 'ym_lalalala', 'ym_rijiu', 'ym_zhongshiweiyu', 'ym_daowuji', 'ym_sp_daowuji', 'ym_mushancai', 'ym_xiaohuanxiong', 'hyyz_xt_sb_daheita', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
		])
		//a+s精品，普通武将
		lib.rank.rarity['rare'].addArray([
			'hyyz_xt_qingque', 'hyyz_xt_bailu', 'hyyz_xt_luocha', 'hyyz_xt_sp_bronya', 'hyyz_ɸ_xierde', 'hyyz_b3_kaiwen', 'hyyz_ɸ_shaoxia', 'hyyz_b3_luocha', 'hyyz_ɸ_kuisangti', 'hyyz_xt_sp_kafuka', 'hyyz_ys_qingqizhe', 'hyyz_xt_yanqing', 'hyyz_b3_chiyuan', 'hyyz_b3_shuoyeguanxing', 'hyyz_xt_jingliu', 'hyyz_ɸ_yelianna', 'hyyz_ys_laiyila', 'hyyz_ys_aierhaisen', 'hyyz_b3_xier', 'hyyz_xt_tuopa', 'hyyz_ys_hutao', 'hyyz_xt_sp_ruanmei', 'hyyz_xt_luka', 'hyyz_ys_baizhu', 'hyyz_xt_sp_fuxuan', 'hyyz_ys_sb_nahida', 'hyyz_ys_furina', 'hyyz_ys_nahida', 'hyyz_xt_danhengbailu', 'hyyz_ys_shanhugongxinhai', 'hyyz_xt_sp_luocha', 'hyyz_b3_zhongyanzhilvzhe', 'hyyz_b3_xinyanzhilvzhe', 'hyyz_xt_shiwaluo', 'hyyz_xt_sp_heitiane', 'hyyz_xt_sangbo', 'hyyz_b3_aboniya', 'hyyz_b3_kesimo', 'hyyz_b3_meibiwusi', 'hyyz_b3_sp_weierwei', 'hyyz_b3_ying', 'hyyz_xt_huahuo', 'hyyz_xt_sp_shajin', 'hyyz_xt_shajin', 'hyyz_xt_kafuka', 'hyyz_xt_heitiane', 'hyyz_xt_xier', 'hyyz_zzz_11', 'hyyz_xt_re_liuying', 'hyyz_ys_sp_leidianying', 'hyyz_ɸ_liang', 'hyyz_xt_sb_ruanmei', 'hyyz_ys_xiaogong', 'meng_feixiao', 'hyyz_xt_sp_sanyueqi', 'hyyz_ɸ_chunjin_aiyafala', 'hyyz_ɸ_xi', 'hyyz_xt_sb_fuxuan', 'hyyz_xt_zhigengniao', 'hyyz_xt_kekena', 'hyyz_xt_moze', 'hyyz_xt_heita', 'hyyz_ys_kaqina', 'hyyz_ys_xigewen', 'hyyz_ɸ_cuicui', 'hyyz_xt_sp_daheita', 'hyyz_ɸ_miyali', 'hyyz_ɸ_anjielina', 'hyyz_xt_sp_tingyun', 'hyyz_xt_sp_yinzhi', 'hyyz_ɸ_shengongbao', 'hyyz_ɸ_guanzhe', 'hyyz_ys_youla', 'hyyz_xt_yunli', 'hyyz_xt_sp_zhenliyisheng', 'hyyz_ys_yianshan', 'hyyz_ys_aikefei', 'hyyz_b3_sp_kiana', 'hyyz_ɸ_jiguoyuanyi', 'hyyz_xt_fengjin', 'hyyz_ys_mengjianyueruixi', 'hyyz_xt_saifeier', 'hyyz_xt_sp_jingliu', 'ym_re_canghaiyisu', 'ym_menghai', 'ym_sp_menghai', 'ym_sp_miealiei', 'ym_re_miealiei', 'ym_youyi', 'ym_xilin', 'ym_xinzhi', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
		])
		//a平凡，天牢，强度拉稀
		lib.rank.rarity['junk'].addArray([
			'hyyz_ys_kalilu', 'hyyz_b3_saixiliya', 'hyyz_xt_wo_danheng', 'hyyz_xt_natasha', 'hyyz_ys_leidianzhen', 'hyyz_ys_sp_furina', 'hyyz_ys_sp_zhongli', 'hyyz_ys_sp_nahida', 'hyyz_xt_sp_botiou', 'hyyz_b3_sp_meibiwusi', 'hyyz_xt_wangguiren', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
		])
	}
	if ('武将包') {
		//——————————————自动开启武将包——————————————//
		if (!lib.config['extension_忽悠宇宙_init']) {
			//game.saveConfig('extension_忽悠宇宙_init', true);
			//game.saveConfig('characters', lib.config.characters.concat(['hyyzCharacter', 'hyyzmysCharacter', 'hyyzmengCharacter', 'hyyzymCharacter', 'hyyzysltCharacter']))
			//game.saveConfig('cards', lib.config.cards.concat(['hyyzCard', 'hyyzmengCard']));
		};
		//——————————————清理重复包——————————————//
		lib.config.characters = [...new Set(lib.config.characters)];
		lib.config.all.characters = [...new Set(lib.config.all.characters)];
		lib.config.cards = [...new Set(lib.config.cards)];
		lib.config.all.cards = [...new Set(lib.config.all.cards)];
	}
}
const CONFIG = {
	group: {//投稿武将入口
		name: '<span style="color: #ea059e">投稿武将入口(点击打开图片)▶</span>',
		clear: true,
		onclick() {
			if (this.group == undefined) {
				var more = ui.create.div('.group',
					`<b style=" color: #ea059e" >紫灵谷の小宇宙：</b>519463281<br>
					<img src ="${lib.assetURL}extension/忽悠宇宙/hyyzGroup.png" style ="width: 220px">`);
				this.parentNode.insertBefore(more, this.nextSibling);
				this.group = more;
				this.innerHTML = '<span style = "color: #ea059e">投稿武将入口(点击收起图片)▼</span>';
			} else {
				this.parentNode.removeChild(this.group);
				delete this.group;
				this.innerHTML = '<span style = "color: #ea059e">投稿武将入口(点击打开图片)▶</span>';
			};
		},
	},
	type: {//分类方式
		name: '更换扩展包分类',
		init: '0',
		intro: '按圆梦时间分类：依据圆梦入扩时间分类；<br>按角色来源分类：大类为游戏名，小类为角色所属区域；<br>按设计师分类：依据不同设计作品分类',
		item: {
			'0': '按圆梦时间分类',
			'1': '按角色来源分类',
			'2': '按设计师分类',
		}
	},
	buff: {//忽悠模式
		name: 'buff系统(建议打开)',
		intro: "若关闭，新buff不能再被赋予，部分武将技能效果无法执行",
		init: true,
		clear: false,
	},
	weakness: {
		name: '弱点系统(即时)',
		intro: "若开启，角色开局获得两个弱点；若关闭，立即清除场上所有的弱点",
		init: true,
		clear: false,
		update() {
			if (lib.config["extension_忽悠宇宙_weakness"] != true && game.filterPlayer2 && lib.element.player.$syncWeakness) game.filterPlayer2((current => {
				current.$syncWeakness()
			}))
		},
	},
	weaknessPosition: {//弱点显示位置
		name: '弱点显示位置',
		init: 'top',
		intro: '弱点图标在武将牌附近的显示位置',
		item: {
			'top': '上',
			'bottom': '下',
			'left': '左',
			'right': '右',
		},
		onclick(item) {
			game.saveConfig('extension_忽悠宇宙_weaknessPosition', item);
			if (game.countPlayer2() > 0) game.filterPlayer2(i => i.$syncWeakness())
		}
	},
	weaknessPosition2: {//弱点内外侧显示位置
		name: '弱点内外侧显示位置',
		init: 'out',
		intro: '弱点图标在武将牌内外的情况',
		item: {
			'in': '内侧',
			'on': '边缘',
			'out': '外侧',
		},
		onclick(item) {
			game.saveConfig('extension_忽悠宇宙_weaknessPosition2', item);
			if (game.countPlayer2() > 0) game.filterPlayer2(i => i.$syncWeakness())
		}
	},
	loadUpdateContent: {//历史记录
		name: '<span style="color: #ea059e">历史更新记录(点击查看)▶</span>',
		intro: '查看历史更新',
		onclick() {
			if (this.loadUpdateContent == undefined) {
				let strs = [
					'<b style="color: #008cff">2023-6-23</b>',
					'《星铁杀》开始更新',
					'<b style="color: #008cff">2023-7-8</b>',
					'加入首个圆梦武将，开始筹备圆梦计划',
					'<b style="color: #008cff">2023-9-4</b>',
					'扩展正式改名《忽悠宇宙》，开启装备更新',
					'<b style="color: #008cff">2024-3-8</b>',
					'骊歌最后一期视频更新，群友开始代码助力（泪目）',
					'忽悠宇宙开启“大共创时代”，圆梦计划由投稿挑选转变为群赛',
					'<b style="color: #008cff">2024-8-9</b>',
					'忽悠宇宙的后续更新计划转由尾巴酱进行',
					'<b style="color: #008cff">2024-11-1 『v2.6』</b>',
					'改了扩展底层架构，删改了大量武将，版本号遵循“v周年.额外月份”的形式。',
					'<b style="color: #008cff">2024-11-9 『v2.6a』</b>',
					'函数适配异步和1.10.15，将部分武将的衍生技或特殊技能效果替换为[效果]',
					'dotdebuff默认上限5层，[净化]增加效果“熄灭[点燃]的牌”，增加[驱散]',
					'新增介绍弹窗，其他详情参见“帮助”菜单',
					'删除持明族复活',
					'<b style="color: #008cff">2024-12-8 『v2.7』</b>',
					'添加、补充阮梅（柚衣）的专有卡牌',
					'点燃牌改为事件（可以触发时机）',
					'<b style="color: #008cff">2024-12-8 『v2.7a』</b>',
					'增加chooseToMove_new函数（来自无名杀1.10.16），增加背水、断拒和弹窗提示',
					'<b style="color: #008cff">2024-12-20 『v2.7b』</b>',
					'重写了忽悠动态包和忽悠宇宙的动态立绘代码，相关体验请下载“忽悠动态包”',
					'补充了含紫灵谷的骊歌在内的三十余名武将台词和语音',
					'重写忽悠动态包的那维莱特的代码和天气系统',
					'<b style="color: #008cff">2025-1-1 『v3.1』</b>',
					'分离《忽悠宇宙》与《圆梦计划》，忽悠宇宙进行机制探索，武将在圆梦计划更新',
					'新增弱点击破系统',
					'版本号遵循“v年序.当前月份”的形式续写',
					'<b style="color: #008cff">2025-1-18 『v3.1b』</b>',
					'删除涂鸦debuff，改为植入弱点',
					'<b style="color: #008cff">2025-7-17 『v3.7』</b>',
					'合并《忽悠宇宙》与《圆梦计划》，新增奇物系统（看情况取舍）',
					'<b style="color: #008cff">2025-7-17 『v3.7a』</b>',
					'修复了冰冻被调离后无法脱离效果的bug',
					'为火漆类奇物添加不能打出、弃置、响应的机制',
					'<b style="color: #008cff">2025-7-17 『v3.7b』</b>',
					'修复了奇物会进入弃牌堆的bug',
					'增加了忽悠模式的开关。',
					'未来100-200天内无限期延期更新',
					'<b style="color: #008cff">2026-?-? 『v4.1』</b>',
					'',
					'',
				]
				var more = ui.create.div('.loadUpdateContent', `　<div style="border: 1px solid blue"><font size=2px>` + strs.join('<br>') + `</font></div>`);
				this.parentNode.insertBefore(more, this.nextSibling);
				this.loadUpdateContent = more;
				this.innerHTML = '<span style="color: #ea059e">历史更新记录(点击收起)▼</span>';
			} else {
				this.parentNode.removeChild(this.loadUpdateContent);
				delete this.loadUpdateContent;
				this.innerHTML = '<span style="color: #ea059e">历史更新记录(点击查看)▶</span>';
			};
		},
		clear: true,
	},

};
const HELP = {
	//效果介绍
	'<span style="font-size:23px">忽悠<span style="color: #07a6f0">[效果]</span></span>':
		`<div style="margin:10px">关于<b style="color:#07a6f0">[效果]</b></div>

        <ul>
            <li>本扩展包特有的<span style="color:#07a6f0">[效果]</span>机制，分为<b style="color:#0aba0a">增益[效果]-buff</b>和<b style="color:#ff6666">负面[效果]-debuff</b>，其中debuff包含<b style="color:#ff6666">持续[效果]-dotdebuff</b>。</li>
            <li><b style="color:#0aba0a">buff</b>多数情况下拥有正面效果，一般不会被移除。</li>
            <li><b style="color:#ff6666">debuff</b>多数情况下拥有负面效果，一般可以被群扩中能移除debuff的操作移除。</li>
            <li><b style="color:#ff6666">dotdebuff</b>多数情况下拥有负面效果且属于debuff。除“引爆”不消耗层数外，每结算一次，移除一层。</li>
        </ul>

		<b style="margin:10px;color:#07a6f0">名词介绍</b>

        <ul>
            <li><b style="color:#07a6f0">[效果]</b>仅能被本扩的武将赋予，[净化]能解除debuff。</li>
            <li><b style="color:#0aba0a">净化</b>移除对象判定区的牌、复原武将牌、移除所有debuff、熄灭[点燃]的牌。</li>
            <li><b style="color:#ff6666">驱散</b>移除对象所有buff。</li>
            <li><b style="color:#ff6666">引爆</b>立即结算对象拥有的dotdebuff中的高亮效果。</li>
        </ul>

		<b style="margin:10px;color:#07a6f0">详细介绍</b>

        <ul>
            <li><b style="color:#0aba0a">[加速]buff</b>下个弃牌阶段开始前，插入一个出牌阶段。</li>
            <li><b style="color:#ff6666">[重伤]debuff</b>下次受到的伤害+1。</li>
            <li><b style="color:#ff6666">[虚弱]debuff</b>下次造成的伤害-1。</li>
            <li><b style="color:#ff6666">[减速]debuff</b>下个出牌阶段开始前，插入一个弃牌阶段。</li>
            <li><b style="color:#ff6666">[冻结]debuff</b>当前回合内不能使用、打出或弃置手牌。</li>
            <li><b style="color:#ff6666">[禁锢]debuff</b>使用的下一张牌无效。</li>
            <li><b style="color:#ff6666">[纠缠]debuff</b>下次成为即时牌的目标后，重铸一张相同类型的牌，否则此牌结算两次。</li>
            <li><b style="color:#ff6666">[裂伤]dotdebuff</b>（每层）该角色使用牌指定其他角色后<span style="color:#f40cf0">失去1点体力</span>。</li>
            <li><b style="color:#ff6666">[灼烧]dotdebuff</b>（每层）该角色<span style="color:#f40cf0">[点燃]区域内随机两张牌（优先手牌）</span>。</li>
            <li><b style="color:#ff6666">[风化]dotdebuff</b>（每层）准备阶段，该角色<span style="color:#f40cf0">受到1点风蚀伤害</span>。</li>
            <li><b style="color:#ff6666">[触电]dotdebuff</b>（每层）始终横置；该角色使用或打出无目标的牌后，<span style="color:#f40cf0">受到1点雷电伤害</span>。</li>
        </ul>`,

	'忽悠<span style="color:#07a6f0">属性</span>':
		`<div style="margin:10px">关于<b style="color: #008cff">新属性</b></div>
		<ul>
            <li><span style="text-shadow: 1px 1px 2px rgb(0, 255, 0),0 0 8px rgb(80, 220, 80);color: white">“风蚀”hyyz_wind</span>。</li>
            一名角色受到<span style="text-shadow: 1px 1px 2px rgb(0, 255, 0),0 0 8px rgb(80, 220, 80);color: white">风蚀</span>伤害时，弃置至少一张牌；每额外弃置两张牌，此伤害减少1点。<li></li>
            <li><span style="text-shadow: 1px 1px 2px rgb(115, 0, 255),0 0 8px rgb(80, 0, 180);color: white">“量子”hyyz_quantum</span>。</li>
            一名角色使用<span style="text-shadow: 1px 1px 2px rgb(115, 0, 255),0 0 8px rgb(80, 0, 180);color: white">量子</span>【杀】指定目标后，可以重铸一张牌，然后目标角色随机重铸一张同类型的牌。<li></li>
            <li><span style="text-shadow: 1px 1px 2px rgb(255, 250, 0),0 0 8px rgb(255, 250, 0);color: white">“虚数”hyyz_imaginary</span>。</li>
            一名角色受到<span style="text-shadow: 1px 1px 2px rgb(255, 250, 0),0 0 8px rgb(255, 250, 0);color: white">虚数</span>伤害时/使用虚数【杀】指定目标后，受伤角色/目标角色本回合护甲和防具失效。<li></li>
            <li><span style="text-shadow: 1px 1px 2px rgb(0, 128, 255),0 0 8px rgb(0, 100, 200);color: white">“水熵”hyyz_water</span>。</li>
            一名角色受到<span style="text-shadow: 1px 1px 2px rgb(0, 128, 255),0 0 8px rgb(0, 100, 200);color: white">水熵</span>伤害时，将最后一件装备牌向远离伤害来源的座次方向移动一位。若没有合法空置区域，改为弃置之。<li></li>
        </ul>`,
}
export { ARENAREADY, PREPARE, PRECONTENT, CONTENT, CONFIG, HELP };