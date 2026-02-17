'use strict';
import { lib, game, ui, get, ai, _status } from '../../../noname.js';
//技能等相关信息
/**@type { SMap < SMap< [String, Character, String, String] | Skill | String>> } */
const characters = {
	2601: {
		hyyz_xt_sp_jingliu: ['镜流', ['female', 'hyyz_xt', 4, ['mengmysfeiguang'], ['die:hyyz_xt_jingliu', 'img:extension/忽悠宇宙/asset/character/image/hyyz_xt_jingliu.jpg']], '尾巴酱', '习自微雨的李素裳'],
		mengmysfeiguang: {
			audio: 'hyyzfeiguang',
			enable: 'phaseUse',
			usable: 2,
			filter(event, player) {
				return player.countCards('h') != player.hp
			},
			async content(event, trigger, player) {
				const result = await player.changeCardTo(player.hp)
					.forResult();
				let cards;
				if (result.bool) {
					if (result.type == 'draw' && result.cards.some(i => i.name == 'sha')) {
						cards = result.cards.filter(i => i.name == 'sha' && player.getCards('he').includes(i))
					}
					if (result.type == 'chooseToDiscard' && result.cards.some(i => lib.translate[i.name]?.includes('剑'))) {
						cards = result.cards.filter(i => lib.translate[i.name]?.includes('剑') && get.position(i) == 'd')
					}
				}
				if (cards) {
					const card = get.autoViewAs({ name: 'sha', nature: 'ice' }, cards);
					await player.chooseUseTarget(card, cards, true, false);
				}
			},
			ai: {
				order: 1,
			}
		},
		mengmysfeiguang_info: '飞光|出牌阶段限两次，你可以调整手牌至体力值，若因此得到含“杀”牌或弃置含“剑”牌，将之当无距离次数限制的冰【杀】使用。',

		hyyz_b3_re_hua: ['华', ['female', 'hyyz_b3', 3, ['hyyzcunjin', 'hyyzb3refusheng'], ['die:hyyz_b3_hua', 'img:extension/忽悠宇宙/asset/character/image/hyyz_b3_hua.jpg']], '尾巴酱', '融汇自骊歌和冷若寒的华'],
		hyyzb3refusheng: {
			audio: 'hyyzfusheng',
			persevereSkill: true,
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			filter(event, player) {
				if (player.countCards("he")) return false;
				const evt = event.getl(player);
				return evt && evt.player == player && evt.cards2.length
			},
			async cost(event, trigger, player) {
				const cards = trigger.getl(player).hs.filter(i => get.position(i) == 'd');
				let list = ['失去1点体力', '减1点体力上限', '断拒'];

				const { index } = await player
					.chooseControlList(list, get.prompt('hyyzb3refusheng'))
					.set('ai', () => {
						const player = _status.event.player, list = _status.event.list;
						let k = [];
						if (player.hp > 1 && list.includes('失去1点体力')) k.add(list.indexOf('失去1点体力'));
						if (cards.some(i => player.hasUseTarget(i) && player.getUseValue(i) >= 20) && player.isDamaged() && list.includes('减1点体力上限')) k.add(list.indexOf('减1点体力上限'));
						if (k.length >= 2) k.add(3)
						return k.randomGet();
					})
					.set('cards', cards)
					.set('list', list)
					.forResult();
				if (index != list.length) {
					event.result = {
						bool: true,
						cards: cards,
						cost_data: list[index],
					}
				}
			},
			async content(event, trigger, player) {
				switch (event.cost_data) {
					case '断拒': await player.removeSkills(event.name); break;
					case '失去1点体力': await player.loseHp(); break;
					case '减1点体力上限': await player.loseMaxHp(); break;
				}
				await player.drawTo(player.getHandcardLimit())
			},
		},
		hyyzb3recunjin_info: '寸劲|当你<span class=yellowtext>使用</span>/<span class=firetext>弃置</span>/<span class=thundertext>获得</span>牌后，你可以<span class=yellowtext>弃置</span>/<span class=firetext>摸</span>/<span class=thundertext>使用</span>一张牌。',
		hyyzb3refusheng_info: `浮生|持恒技，你失去所有牌后，可以<br>①失去1点体力；<br>②减1点体力上限；<br>${get.hyyzIntroduce('断拒')}：失去此技；<br>然后将手牌摸至上限。`,

		hyyz_ys_yanfei: ['烟绯', ['female', 'hyyz_ys', 3, ["hyyzwoxuan", "hyyzhuanlv"], []], '秉法治衡-尾巴酱', '一、设计前，我为烟绯的设计定下方向：<br>1.烟绯应当为辅助角色，以支持队友发育和减少损失为核心收益，也应成为被敌人围攻时轻易摘掉的突破口。实机虽是输出，但严重偏离人设，实不可取。<br>2.我希望烟绯技能的发动不取决于自己，一者她是法律咨询师，工作收入依托委托人，二者敌我都可邀请烟绯进行调解，此等公平才能体现法律的无私性（只是届时，需要一些“小巧思”确保敌方难以借此牟利）。<br>3.我希望她和钟离（我的旧设）的设计有区分。钟离有神性，烟绯没有，钟离的视角更宏观，烟绯更基层，钟离对所有人负责，烟绯只对委托人负责。烟绯若把目光放到整个场上，便不符合角色调性，因此适合局部化、私域化。<br>4.我希望增加思考深度，除了叙事安排，烟绯值得和应当增加多维度多选择路径。<br>二、设计时的思路如下：<br>1.〖斡旋〗以伤害事件为起因，用“交出牌”这一动作兼顾实战时“区分敌我”的需求和设计中“不菲费用”的人设。议事即为调解，黑色索赔量取决于委托人、红色处罚结果取决于〖焕律〗。若议事无结果，烟绯便不得喘息恢复精力。<br>其中情形较为复杂：<br>①若三人参与，友方可交出大多手牌（战时可传递议事亮牌信号），亮牌中敌我均存在博弈事项（p.s.敌人发动此技，基本仅存在靠议事黑拉牌差，赌烟绯千芬上身亮黑资敌损友，其他情况都对敌方几乎没有裨益，可满足实战需求）。<br>②若二人参与（烟绯本人受伤/友方交出所有手牌），二人亮牌有一半概率议事无果，烟绯无法回复体力，易成为团队突破口。不建议友方为了牌差收益将所有手牌都托付烟绯，调解一事非烟绯一人责任，委托人亦须出面帮忙。<br>2.〖焕律〗可成为〖斡旋〗新的博弈点，也可成为〖斡旋〗中多方的最优解。〖斡旋〗的议事是明置牌的主要来源，烟绯的明置牌将限制所有人，就像每项法律政策的公布都会影响所有人、烟绯的意见也是这场议事博弈的关键。可能导致当前回合角色（大概率为伤害来源）无法继续出牌和被迫弃置高价值牌，可能导致受伤角色不能再出牌反抗，可能也会导致烟绯不能弃置其他花色牌无法命中【火攻】或减少议事黑的弃牌量。<br>三、设计后不破坏意象的技能调整点：<br>1.〖斡旋〗的触发率、至多“三”张牌<br>2.〖焕律〗的“花色”可改为其他卡牌属性'],
		hyyzwoxuan: {
			audio: 2,
			trigger: {
				global: "damageEnd",
			},
			filter(event, player) {
				return event.player == player || event.player.countCards('h') > event.player.hp
			},
			async cost(event, trigger, player) {
				const prompt = `是否${trigger.source ? '对' + get.translation(trigger.source) : ''}发动【斡旋】？`,
					buffStr = '<br>黑，你视为对双方使用【调剂盐梅】；红，你视为对伤害来源使用【火攻】。'
				if (trigger.player == player) {
					const result = await player
						.chooseBool()
						.set('prompt', prompt)
						.set('prompt2', `与${get.translation(trigger.source)}议事。${buffStr}`)
						.set('ai', () => true)
						.forResult()
					event.result = {
						bool: result.bool,
						targets: [trigger.source, trigger.player].filter(i => i?.isIn()).unique().sortBySeat(),
					}
				}
				else {
					const result = await trigger.player
						.chooseCard(trigger.player.countCards('h') - trigger.player.hp, 'h')
						.set('prompt', prompt)
						.set('prompt2', `交给${get.translation(player)}超出体力值的手牌，与其和${get.translation(trigger.source)}议事。${buffStr}`)
						.set('ai', (card) => {
							if (_status.event.att > 0) return 6 - get.value(card)
							return -1
						})
						.set('att', get.attitude(trigger.player, player))
						.forResult();
					event.result = {
						bool: result.bool,
						targets: [player, trigger.source, trigger.player].filter(i => i?.isIn()).unique().sortBySeat(),
						cards: result.cards
					}
				}
			},
			logTarget: "targets",
			async content(event, trigger, player) {
				const { targets, cards } = event;
				if (cards?.length > 0) await trigger.player.give(cards, player, false).forResult();
				if (targets.every(i => !i.countCards('h'))) return;
				const result = await trigger.player
					.chooseToDebate()
					.set('list', targets)
					.set('ais', [player, trigger.player, trigger.source])
					.forResult()
				if (result.bool) {
					const { bool, targets, opinion, opinions } = result;//议事完成,结果颜色,目标,参与颜色,（red:[人，意见牌]..others:[]）
					if (opinion == "red") {
						await player.recover();
						if (trigger.source?.countCards('h') > 0) await player.useCard(trigger.source, get.autoViewAs({ name: 'huogong', isCard: true }, []))
					} else if (opinion == "black") {
						await player.recover();
						const tiaojiyanmei = get.autoViewAs({
							name: 'tiaojiyanmei',
							//storage: {
							//    hyyzwoxuan: (cards?.length > 1) ? cards.length : 1
							//},
							isCard: true
						}, [])
						await player.useCard([trigger.player, trigger.source].unique(), tiaojiyanmei)
					}
				}
			},
		},
		hyyzhuanlv: {
			audio: 2,
			trigger: {
				player: "showCardsAfter",
				global: "chooseToDebateAfter",
			},
			filter(event, player) {
				if (event.name == 'showCards') return event.cards.length > 0;
				let opinions = event.opinions.slice();
				for (let opinion of opinions) {
					for (let target_card of event.result[opinion]) {
						if (target_card[0] == player && get.itemtype(target_card[1]) == 'card') return true;
					}
				}
			},
			forced: true,
			async content(event, trigger, player) {
				const cards = [];
				if (trigger.name == 'showCards') {
					cards.addArray(trigger.cards);
				} else {
					let opinions = trigger.opinions.slice();
					for (let opinion of opinions) {
						for (let target_card of trigger.result[opinion]) {
							if (target_card[0] == player && get.itemtype(target_card[1]) == 'card') cards.add(target_card[1])
						}
					}
				}
				await player.addShownCards(cards, 'visible_hyyzhuanlv')
				let suits = player
					.getCards('h', (card) => card.hasGaintag('visible_hyyzhuanlv'))
					.map(i => get.hyyzSuit(i))
					.unique()
					.join('')
				player.addTip('hyyzhuanlv', '焕律' + suits)
				player.when({
					global: 'phaseAfter'
				}).then(() => {
					player.hideShownCards(player.getShownCards());
					player.removeTip('hyyzhuanlv')
				})
			},
			global: "hyyzhuanlv_global",
		},
		hyyzhuanlv_global: {
			mod: {
				cardDiscardable(card, player, eventName, result) {
					const suits = []
					game.countPlayer(current => (
						current.hasSkill('hyyzhuanlv') &&
						current.getShownCards().forEach(card => { suits.add(get.suit(card, current)) })
					))
					if (suits.length > 0 && !suits.includes(get.suit(card, player))) return false;
				},
				cardUsable(card, player, num) {
					const suits = []
					game.countPlayer(current => (
						current.hasSkill('hyyzhuanlv') &&
						current.getShownCards().forEach(card => { suits.add(get.suit(card, current)) })
					))
					if (suits.length > 0 && !suits.includes(get.suit(card, player))) return false;
				},
			},
		},
		visible_hyyzhuanlv: "律",
		hyyzwoxuan_info: "斡旋|一名角色受到伤害后，其可以交给你超出体力值的手牌（若为你则跳过这一步），向你和伤害来源发起议事。若结果为：<br>黑，你视为对双方使用【调剂盐梅】；<br>红，你视为对伤害来源使用【火攻】。<br>除非议事无结果，否则你回复1点体力。",
		hyyzhuanlv_info: "焕律|你展示的牌明置至回合结束；若你有明置牌，所有角色只能使用和弃置与之花色相同的牌。",

		hyyz_xt_huanyv_qingque: ['青雀', ['female', 'hyyz_xt', 3, ['hyyzfuxia', 'hyyzyixing'], ['die:hyyz_xt_qingque']], '韫光藏心-尾巴酱', '定位上，以雀儿的性情，不可能是纯输出和纯辅助，只有八面玲珑却博而不精最适合她。因“不主动”的原则，雀儿绝不会有主动技，〖赋瑕〗虽既有卜者也有摸鱼，但雀儿总会在“不负责”的态度下扣藏工作，仅在有〖逸兴〗时才对部分工作小试牛刀。她能秉持着“不拒绝”的理念为他人兜底，却也会把剩余工作甩给别人，自己安心摸鱼。<br>设计上，除了麻将碰和凑花色的“形似”，亦有麻将稳中求胜、厚积薄发、有舍有得的“神韵”。因为这是雀儿喜欢麻将的原因，也是雀儿本人的处事智慧。与符玄的急于上位不同，在争权夺利的官场，雀儿静观云卷，默候春暄，慵懒而不庸碌、淡泊而不患失，秉持着藏锋敛锷和恰如其分的本真，亦有着怡然自得的简单追求。'],
		hyyzfuxia: {
			audio: 'hyyzlaoyue',
			trigger: {
				player: ['phaseDrawBegin', 'phaseUseBegin']
			},
			filter(event, player, name) {
				const card = get.autoViewAs({ name: (name == 'phaseDrawBegin' ? 'dongzhuxianji' : 'yiyi'), isCard: true }, [])
				return player.canUse(card, player)
			},
			async content(event, trigger, player) {
				trigger.cancel()
				const card = get.autoViewAs({ name: (trigger.name == 'phaseDraw' ? 'dongzhuxianji' : 'yiyi'), isCard: true }, [])
				await player.useCard(card, player);
			},
			group: 'hyyzfuxia_buff',
			subSkill: {
				buff: {
					trigger: {
						player: ['gainAfter', 'loseAfter']
					},
					locked: true,
					charlotte: true,
					filter(event, player) {
						if (event.name == 'gain') {
							return event.getParent(2).name == 'dongzhuxianji' && event.getParent(4).name == 'hyyzfuxia' && event.cards.some(i => get.owner(i) == player)
						} else {
							return event.getParent(3).name == 'yiyi' && event.getParent(5).name == 'hyyzfuxia' && event.cards.some(i => get.position(i, true) == "d")
						}
					},
					async cost(event, trigger, player) {
						const cards = trigger.cards.filter(i => (trigger.name == 'gain' ? get.owner(i) == player : get.position(i, true) == "d"));
						const result = await player
							.chooseToMove("赋瑕：将牌按顺序置于牌堆底")
							.set("list", [["牌堆底(上→下)", cards]])
							.set("processAI", (list) => {
								const cards = list[0][1].slice(0);
								cards.sort((a, b) => get.value(b) - get.value(a));
								return [cards];
							})
							.forResult()
						if (result.bool) {
							event.result = {
								bool: true,
								cards: result.moved[0]
							}
						}
					},
					async content(event, trigger, player) {
						let cards = event.cards;
						if (trigger.name == 'gain') await player.lose(cards, ui.cardPile);
						game.log(player, '将' + get.cnNumber(cards.length) + '张牌置于牌堆底');
						for (let i = 0; i < cards.length; i++) {
							const card = cards[i];
							card.fix();
							ui.cardPile.appendChild(card);
						}
					},
				}
			}
		},
		hyyzyixing: {
			audio: 'hyyzmenqing',
			trigger: {
				global: ["discardAfter"],
			},
			filter(event, player) {
				if (game.hasPlayer(i => i.hasSkill('hyyzyixing_x'))) return false;
				return event.cards.length > 0
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				const bottomCards = get.bottomCards(3), loseCards = trigger.cards.filter(i => get.position(i) == 'd')

				await player.showCards(bottomCards, get.translation(player) + "发动了【逸兴】");
				await game.cardsGotoOrdering(bottomCards);

				const alls = bottomCards.concat(loseCards);

				let max = { num: 0, suits: [] }, map = {};
				for (let i of alls) {
					const suit = get.suit(i);
					map[suit] = map[suit] || 0
					map[suit]++;
					if (map[suit] == max.num) {
						max.suits.push(suit)
					} else if (map[suit] > max.num) {
						max = {
							num: map[suit],
							suits: [suit]
						}
					}
				}


				while (alls.some(i => player.hasUseTarget(i, true, false) && max.suits.includes(get.suit(i)))) {
					const result1 = await player
						.chooseButton(['逸兴：依次使用这些牌', '选择一张使用', alls])
						.set('selectButton', 1)
						.set('suits', max.suits)
						.set('filterButton', (button) => {
							return _status.event.player.hasUseTarget(button.link, true, false) && _status.event.suits.includes(get.suit(button.link))
						})
						.set('ai', (button) => _status.event.player.getUseValue(button.link) || get.value(button.link))
						.forResult()
					if (result1.links) {
						const result2 = await player.chooseUseTarget(result1.links[0], true)
							.forResult();
						if (result2.bool) alls.remove(result1.links[0])
					}
				}
				if (alls.length > 0) {
					const result = await player
						.chooseTarget('hyyzyixing', '将' + get.translation(alls) + '交给手牌数不大于你的角色，此技失效至该角色的回合开始')
						.set('filterTarget', (card, player, target) => {
							return target.countCards('h') <= _status.event.player.countCards('h')
						})
						.set('ai', (target) => get.attitude2(target))
						.forResult()
					if (result.targets) {
						await result.targets[0].gain(alls, 'gain2')//.gaintag.add("hyyzyixing")
						result.targets[0].addTempSkill('hyyzyixing_x', { player: ['phaseBefore', 'dieBegin'] })
					}
				}
			},
			subSkill: {
				x: {
					mark: true,
					marktext: '忙',
					intro: {
						name: 'hyyzyixing',
						content: '你已被托付重任'
					},
					mod: {
						ignoredHandcard(card, player) {
							if (card.hasGaintag("hyyzyixing")) {
								return true;
							}
						},
						cardDiscardable(card, player, name) {
							if (name == "phaseDiscard" && card.hasGaintag("hyyzyixing")) {
								return false;
							}
						},
					},
					onremove(player, skill) {
						player.removeGaintag("hyyzyixing");
					},
					charlotte: true,
					locked: true,
				}
			}
		},
		hyyzfuxia_info: '赋瑕|你可跳过摸牌阶段/出牌阶段，视为对自己使用【洞烛先机】/【以逸待劳】，并将因此获得/失去的牌置于牌堆底。',
		hyyzyixing_info: '逸兴|一名角色弃置牌后，你可展示牌堆底三张牌，依次使用弃牌和展示牌中花色数最多的牌；将未使用的牌交给手牌数不大于你的角色，此技失效至该角色的回合开始。',

		hyyz_xt_zhishi_qingque: ['青雀', ['female', 'qun', 3, ['hyyzyvcui', 'hyyzqiongming'], ['die:hyyz_xt_qingque']], '冷若寒', ''],
		hyyzyvcui: {
			audio: 'hyyzlaoyue',
			enable: ["chooseToUse"],
			filterCard(card, player) {
				return player.getHistory('gain').reduce((cards, evt) => cards.addArray(evt.cards), []).includes(card)
			},
			position: "hes",
			viewAs: {
				name: "kaihua",
			},
			onuse(result, player) {
				let suits = get.centralCards(true)
					.reduce((suits, card) => {
						suits.add(get.suit(card))
						return suits
					}, [])
				result.card.storage.hyyzyvcui = suits.length
			},
			prompt: "将一张牌当【树上开花】使用",
			group: 'hyyzyvcui_x',
			subSkill: {
				x: {
					audio: 'hyyzangang',
					trigger: {
						player: 'useCardAfter'
					},
					filter(event, player, name) {
						if (event.skill != 'hyyzyvcui' || !event.card.storage.hyyzyvcui) return false;
						const suits = get.centralCards(true).reduce((suits, card) => {
							suits.add(get.suit(card))
							return suits
						}, [])
						return event.card.storage.hyyzyvcui == suits.length
					},
					locked: true,
					charlotte: true,
					async cost(event, trigger, player) {
						event.result = await player.chooseTarget('对一名角色造成1点伤害并洗牌')
							.forResult();
					},
					logTarget: 'target',
					async content(event, trigger, player) {
						game.updateRoundNumber();
						await event.targets[0].damage();
						await game.cardsGotoPile(trigger.cards.filterInD(), "insert");
						await game.washCard()
					},
				}
			}
		},
		hyyzyvcui_info: '玉淬|你可以将一张牌当【树上开花】使用。若本回合弃牌堆中的花色数未因此变化，你可以对一名角色造成1点伤害并洗牌。',
		hyyzqiongming: {
			audio: 'hyyzmenqing',
			trigger: {
				player: 'phaseEnd'
			},
			filter(event, player) {
				return player.getHistory('damage').length > 0 || player.getHistory('lose').length > 0
			},
			async content(event, trigger, player) {
				const a = game.findPlayer(i => i.isMaxHandcard()), b = game.findPlayer(i => i.isMinHandcard())
				const num = Math.abs(a.countCards('h') - b.countCards('h'));
				const result = (a == player || b == player) ? await player.chooseTarget('令任意角色将手牌数调整至' + num).forResult() : [player];
				if (result.targets) {
					await result.targets[0].changeCardTo(num)
				}
			}
		},
		hyyzqiongming_info: '瓊明|你受到过伤害或失去过牌的回合结束时，可以将手牌数调整至全场最大与最小的差值。若你为其中者，改为令任意角色执行。',

	},
	2602: {
		hyyz_ɸ_luotianyi: ['洛天依', ['female', 'hyyz_ɸ', 3, ['mengzhongya', 'mengyinchao'], []], '咩阿栗诶'],
		mengzhongya: {
			forced: true,
			trigger: {
				player: 'useCardAfter'
			},
			usable: 1,
			filter(event, player) {
				return !get.tag(event.card, 'damage')
			},
			async content(event, trigger, player) {
				const num = Math.min(5, get.centralCards().filter(i => !get.tag(i, 'damage')).length);
				if (num < 1) return;

				const cards = get.cards(num);
				await game.cardsGotoOrdering(cards);
				if (_status.connectMode) {
					game.broadcastAll(function () {
						_status.noclearcountdown = true;
					});
				}
				event.given_map = {};
				if (!cards.length) {
					return;
				}
				// event.goto -> do while
				do {
					const { bool, links } =
						cards.length == 1
							? { links: cards.slice(0), bool: true }
							: await player.chooseCardButton("众雅：请选择要分配的牌", true, cards, [1, cards.length]).set("ai", () => {
								if (ui.selected.buttons.length == 0) {
									return 1;
								}
								return 0;
							}).forResult();
					if (!bool) {
						return;
					}
					cards.removeArray(links);
					event.togive = links.slice(0);
					const { targets } = await player
						.chooseTarget("选择一名角色获得" + get.translation(links), true)
						.set("ai", target => {
							const att = get.attitude(_status.event.player, target);
							if (_status.event.enemy) {
								return -att;
							} else if (att > 0) {
								return att / (1 + target.countCards("h"));
							} else {
								return att / 100;
							}
						})
						.set("enemy", get.value(event.togive[0], player, "raw") < 0)
						.forResult();
					if (targets.length) {
						const id = targets[0].playerid,
							map = event.given_map;
						if (!map[id]) {
							map[id] = [];
						}
						map[id].addArray(event.togive);
					}
				} while (cards.length > 0);
				if (_status.connectMode) {
					game.broadcastAll(function () {
						delete _status.noclearcountdown;
						game.stopCountChoose();
					});
				}
				const list = [];
				for (const i in event.given_map) {
					const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
					player.line(source, "green");
					if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) {
						player.addExpose(0.2);
					}
					list.push([source, event.given_map[i]]);
				}
				game.loseAsync({
					gain_list: list,
					giver: player,
					animate: "draw",
				}).setContent("gaincardMultiple");
			},
		},
		mengyinchao: {
			enable: 'phaseUse',
			usable: 1,
			filter(event, player) {
				return player.countCards('h') > 0
			},
			filterCard: true,
			check(card) {
				return 8 - get.value(card)
			},
			position: 'h',
			discard: false,
			lose: false,
			filterTarget(card, player, target) {
				return player.getNext() == target || target == player.getPrevious()
			},
			async content(event, trigger, player) {
				const gain_target1 = event.targets[0], card1 = event.cards[0];
				const map = new Map()
				await player.showCards([card1], '引潮的起点')
				map.set(player, get.tag(card1, 'damage') > 0 ? '<span class="firetext">失去体力</span>' : '<span class="greentext">回复体力</span>')
				await gain_target1.gain(card1, player, 'give');

				if (gain_target1.countCards('h')) {
					let { cards, targets: gaom_target2 } = await gain_target1
						.chooseCardTarget({
							prompt: '展示并交给邻家一张牌',
							filterCard: true,
							filterTarget(card, player, target) {
								return target == get.player()[_status.event.boolx ? 'getNext' : 'getPrevious']()
							},
							position: 'h',
							ai1(card) {
								let val = get.value(card)
								if (get.tag(card, 'damage')) val -= 10
								return 100 + val
							},
							ai2(target) {
								return 100 + get.attitude(get.player(), target)
							}
						})
						.set('boolx', player.getNext() == gain_target1 ? true : false)
						.forResult()
					if (cards && gaom_target2) {
						const card2 = cards[0];
						await gain_target1.showCards(card2, '引潮的终点')
						map.set(gain_target1, get.tag(card2, 'damage') > 0 ? '<span class="firetext">失去体力</span>' : '<span class="greentext">回复体力</span>')
						await gaom_target2[0].gain(card2, gain_target1, 'give');

						const { targets: chooseTargets } = await player
							.chooseTarget('令任意名展示伤害牌/非伤害牌者失去/回复1点体力', true, [1, 2])
							.set('targetprompt', (target) => map.get(target))
							.set('filterTarget', (card, player, targetx) => {
								return targetx == player || targetx == gain_target1
							})
							.set('ai', (target) => {
								if (get.attitude2(target) > 0) {
									return map.get(target) == '<span class="greentext">回复体力</span>'
								} else {
									return map.get(target) == '<span class="firetext">失去体力</span>'
								}
							})
							.forResult()
						if (chooseTargets) {
							for (let target of chooseTargets) {
								if (map.get(target) == '<span class="firetext">失去体力</span>') await target.loseHp();
								if (map.get(target) == '<span class="greentext">回复体力</span>') await target.recover();
							}
						}
					}
				}
			},
			ai: {
				order: 10,
				result: {
					player(player, target, card) {
						if (player.isDamaged()) return 1
						return -1
					},
					target(player, target, card) {
						if (player.getNext() == target) return (1 + target.getDamagedHp()) + 1
						if (player.getPrevious() == target) return (1 + target.getDamagedHp()) + 1
					}
				}
			}
		},
		"mengzhongya_info": "众雅|锁定技，你每回合首次使用一张非伤害牌后，分配牌顶X张牌（X为本回合弃牌堆中的非伤害牌数且至多为五）。",
		"mengyinchao_info": "引潮|出牌阶段限一次，你可以展示并交给你的邻家一张牌，然后令该角色展示并交给同方向邻家一张牌。若如此做，你可令任意名展示伤害牌/非伤害牌者失去/回复1点体力。",

		hyyz_ɸ_shalangbaizi: ['砂狼白子', ['female', 'hyyz_ɸ', 4, ['mengxieyuan', 'mengkongxi'], []], '咩阿栗诶'],
		mengxieyuan: {
			audio: 6,
			trigger: {
				global: 'phaseBegin'
			},
			filter(event, player) {
				return player.countCards('h') > 0 && event.player != player
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseToGive(trigger.player, 'h', [1, 3])
					.forResult()
			},
			async content(event, trigger, player) {
				const cards = event.cards;
				trigger.player.addGaintag(cards, 'mengxieyuan')
			},
			group: 'mengxieyuan_use',
			subSkill: {
				use: {
					audio: 'mengxieyuan',
					trigger: {
						global: 'useCardAfter'
					},
					filter(event, player) {
						if (!event.cards?.length || event.cards.every(card => get.position(card) != 'd')) return false
						return event.player.hasHistory('lose', (evt) => {
							if (evt.getParent() != event) return false;
							for (let cardid in evt.gaintag_map) {
								if (evt.gaintag_map[cardid].includes('mengxieyuan')) return true
							}
						})
					},
					frequent: true,
					async content(event, trigger, player) {
						let num = 0;
						trigger.player.hasHistory('lose', (evt) => {
							if (evt.getParent() != trigger) return false;
							for (const cardid in evt.gaintag_map) {
								if (evt.gaintag_map[cardid].includes('mengxieyuan')) {
									const card = trigger.cards.find(i => i.cardid == cardid)
									if (get.position(card) == 'd') num++
								}
							}
						})
						player.draw(num)
					}
				}
			}
		},
		mengkongxi: {
			audio: 4,
			enable: 'phaseUse',
			usable: 1,
			sunbenSkill: true,
			async content(event, trigger, player) {
				player.removeSkill("mengkongxi_sunben");
				player.awakenSkill(event.name);
				player.addSkill("mengkongxi_sunben");
				player.addSkill("mengkongxi_fire");

				await player.chooseUseTarget({ name: 'wanjian' }, true)
			},
			subSkill: {
				sunben: {
					trigger: {
						global: "gainAfter",
					},
					filter(event, player) {
						if (event.player == player) return false
						const evt = event.getl(player);
						return evt?.cards2.length;
					},
					charlotte: true,
					forced: true,
					popup: false,
					firstDo: true,
					async content(event, trigger, player) {
						player.addMark("mengkongxi_sunben", trigger.getl(player).cards2.length, false);
						if (player.countMark("mengkongxi_sunben") >= 4) {
							player.removeSkill(event.name);
							if (player.hasSkill("mengkongxi", null, null, false) && !player.hasSkill("mengkongxi")) {
								player.popup("空袭");
								player.restoreSkill("mengkongxi");
								game.log(player, "恢复了技能", "#g【空袭】");
							}
						}
					},

					init(player, skill) { player.setStorage(skill, 0); },
					onremove: true,
					mark: true,
					intro: {
						markcount(num) {
							return (num || 0).toString();
						},
						content: "激昂进度：#/5",
					},
				},
				fire: {
					charlotte: true,
					silent: true,
					trigger: {
						player: 'useCardToTargeted',
						source: 'damageBegin1'
					},
					filter(event, player) {
						if (event.name == 'damage') return event.getParent(4).name == 'mengkongxi'
						return event.getParent(3).name == 'mengkongxi'
					},
					async content(event, trigger, player) {
						if (trigger.name == 'damage') {
							game.setNature(trigger, "fire");
						} else {
							const { bool } = await trigger.target
								.chooseToDiscard('空袭：弃置一张红色牌，否则不能响应', card => {
									return get.color(card, get.player()) == "red";
								})
								.set('ai', (card) => {
									const trigger = get.event().getTrigger(),
										player = get.player();
									if (get.event().num > 2 || !player.canRespond(trigger)) {
										return 0;
									}
									if (player.canRespond(trigger, card)) {
										return 6 - get.value(card);
									}
									return 7 - get.value(card);
								})
								.forResult()
							if (!bool) {
								trigger.getParent().directHit.add(trigger.target);
								trigger.target.popup("不可响应");
								game.log(trigger.target, "不可响应", trigger.card);
							}
						}
					}
				}
			},
		},
		mengxieyuan_info: '协援|其他角色的回合开始时，你可以交出至多三张手牌；这些牌每有一张因使用而进入弃牌堆后，你摸一张牌。',
		mengkongxi_info: '空袭|昂扬技，你可以视为使用一张需弃置一张红色牌才可响应的火【万箭齐发】。激昂：你累计交出四张牌。',

		hyyz_ɸ_zhipeizhilvzhe: ['支配之律者', ['female', 'hyyz_ɸ', 3, ['mengsangchuan', 'mengbeilian'], []], '咩阿栗诶'],
		mengsangchuan: {
			audio: 14,
			enable: "chooseToUse",
			usable: 1,
			filterCard(card) {
				return get.color(card) == "black";
			},
			filter(event, player) {
				return player.countCards("hes", { color: "black" });
			},
			position: "hes",
			viewAs: {
				name: "bingliang",
			},
			prompt: "将一张黑色牌当【兵粮寸断】使用",
			check(card) {
				return 6 - get.value(card);
			},
			group: 'mengsangchuan_give',
			subSkill: {
				give: {
					trigger: {
						global: "judgeEnd",
					},
					filter(event, player) {
						return get.position(event.result.card) == "d";
					},
					async cost(event, trigger, player) {
						event.result = await player
							.chooseTarget(get.prompt2('mengsangchuan'))
							.set('ai', (target) => get.attitude2(target))
							.forResult()
					},
					async content(event, trigger, player) {
						const gainEvent = event.targets[0].gain(trigger.result.card, "gain2");
						gainEvent.giver = player;
					},
				}
			},
			ai: {
				order: 10
			}
		},
		mengbeilian: {
			audio: 'mengsangchuan',
			trigger: {
				global: ["gainAfter", "loseAsyncAfter"],
			},
			filter(event, player) {
				if (event.giver !== player) {
					return false;
				}
				if (event.name === "gain") {
					return event.player != player && event.getg(event.player).length > 0;
				}
				return game.hasPlayer(current => current != player && event.getg(current).length > 0);
			},
			frequent: 'check',
			check(event, player, name) {
				let targets = [];
				if (event.name === "gain") {
					targets.add(event.player)
				}
				game.filterPlayer(current => {
					if (current != player && event.getg(current).length > 0) {
						targets.add(current)
					}
				})
				return targets.some(i => get.attitude2(i) < 0)
			},
			logTarget(event, player, name) {
				let targets = [];
				if (event.name === "gain") {
					targets.add(event.player)
				}
				game.filterPlayer(current => {
					if (current != player && event.getg(current).length > 0) {
						targets.add(current)
					}
				})
				return targets
			},
			async content(event, trigger, player) {
				const currents = [];
				if (trigger.name === "gain") {
					currents.add(trigger.player)
				}
				game.filterPlayer(current => {
					if (current != player && trigger.getg(current).length > 0) {
						currents.add(current)
					}
				})
				for (let current of currents) {
					const { cards } = await player
						.choosePlayerCard('将其的一张牌交给邻家', current, true, 'visible')
						.set('ai', (button) => {
							let value = get.value(button.link)
							if (get.attitude2(current) > 0 && get.color(button.link) == 'black') {
								value *= 2
							} else if (get.color(button.link) == 'red') {
								value *= 2
							}
							return value
						})
						.forResult()
					if (cards) {
						const { targets: ts } = await player
							.chooseTarget('将' + get.translation(cards) + '交给', true, (card, player, target) => {
								return current.getNext() == target || target == current.getPrevious()
							})
							.set('ai', (target) => get.attitude2(target))
							.forResult();
						if (ts) {
							if (get.color(cards[0]) == 'black') {
								current.addTempSkills('mengsangchuan', 'roundStart')
							}
							const gainEvent = ts[0].gain()
							gainEvent.cards = cards;
							gainEvent.animate = 'give';
							gainEvent.source = current;
							gainEvent.giver = player;
							await gainEvent
						}
					}
				}
			},
		},
		mengsangchuan_info: '丧传|出牌阶段限一次，你可以将一张黑色牌当【兵粮寸断】；一张判定牌生效后，你可将之交给其他角色。',
		mengbeilian_info: '悲连|其他角色因你获得牌后，你可以观看其手牌，并将一张牌交给其邻家，其因此交出黑色牌后，本轮拥有〖丧传〗。',//仅能对你指定的目标发动且流程中视为由你交出牌的

		hyyz_ys_die_naweilaite: ['那维莱特', ['male', 'hyyz_ys', 4, ['hyyzyuanping', 'hyyzyvzhi'], []], '谕告的潮音-玄蝶既白', '来自LB扩展，本设仅供学习使用。想要联机体验完整操作，请前往Q群拉布牌社：467721035。'],
		hyyzyuanping: {
			audio: 3,
			trigger: {
				player: 'useCardAfter'
			},
			filter(event, player) {
				return get.type(event.card) == 'basic'
			},
			async cost(event, trigger, player) {
				let list = [];
				const targets = trigger.targets?.filter(i => i.isIn())
				if (targets?.length > 0) list.add('与' + get.translation(targets) + '各摸一张牌')
				list.add('出牌阶段使用【杀】的限制次数+1')

				const { index } = list.length > 1 ? await player
					.chooseControl('cancel2')
					.set('prompt', '渊平：选择一项')
					.set('choiceList', list)
					.set('ai', () => list[list.length - 1])
					.forResult() : { index: 0 }
				if (index != undefined) {
					event.result = {
						bool: true,
						cost_data: list[index]
					}
				}
			},
			async content(event, trigger, player) {
				switch (event.cost_data) {
					case '出牌阶段使用【杀】的限制次数+1': {
						player.addSkill('hyyzyuanping_buff')
						player.storage.hyyzyuanping_buff ??= 0
						player.storage.hyyzyuanping_buff++
						player.addTip('hyyzyuanping', `渊平 ${player.storage.hyyzyuanping_buff}`)
						break;
					}
					default: {
						const targets = trigger.targets.filter(i => i.isIn())
						await game.asyncDraw(targets)
						await player.draw()
					}
				}
			},
			subSkill: {
				buff: {
					mark: true,
					onremove: true,
					marktext: '渊平',
					intro: {
						name: '渊平',
						content: '出杀的次数+#',
					},
					mod: {
						cardUsable(card, player, num) {
							if (card.name == 'sha') return num + player.getStorage('hyyzyuanping_buff', 0)
						},
					},
					charlotte: true,
					silent: true,
					trigger: {
						player: 'phaseUseEnd'
					},
					filter(event, player) {
						return player.getCardUsable('sha') > 0
					},
					async content(event, trigger, player) {
						player.removeSkill(event.name)
						player.removeTip('hyyzyuanping')
					}
				}
			}
		},
		hyyzyvzhi: {
			audio: 3,
			trigger: {
				player: 'useCardToPlayer'
			},
			filter(event, player) {
				return true;
			},
			locked: true,
			async cost(event, trigger, player) {
				let str = '雨止：重铸一张本回合未因此重铸过的非基本牌';
				const historys = player.getAllHistory('useCard', (evt) => evt != trigger.getParent());
				let targets = [];
				if (historys?.length) {
					targets = historys.pop().targets.unique();
					if (targets.length == 1) str += `，将目标改为${get.translation(targets[0].getNext())}`
				}

				let list = [get.number(trigger.card), trigger.target.getSeatNum(), player.countCards('h')]

				const { cards } = await player
					.chooseCard(str)
					.set('prompt', str)
					.set('prompt2', new Set(list).size == 3 ? '取消此牌将无效' : '取消则正常结算')
					.set('filterCard', (card) => {
						if (get.type(card) == 'basic') return false
						const names = []
						game.getGlobalHistory('everything', (evt) => {
							if (evt.player == player && evt.name == 'recast' && evt.getParent().name == 'hyyzyvzhi') {
								names.addArray(evt.cards.map(card => card.name))
							}
						});
						return !names.includes(card.name)
					})
					.forResult()
				if (cards) {
					event.result = {
						bool: true,
						cards: cards,
					}
					if (targets.length == 1) event.result.targets = [targets[0].getNext()]
				}
				else if (new Set(list).size == 3) {
					event.result = {
						bool: true,
					}
				}
			},
			async content(event, trigger, player) {
				if (event.cards) {
					await player.recast(event.cards)
					if (event.targets) {
						const targets = event.targets;
						trigger.targets = targets;
						trigger.getParent().targets = targets;
						trigger.getParent().triggeredTargets1 = targets;
						game.log(targets, "成为了", trigger.card, "的新目标");
					}
				} else {
					trigger.getParent().all_excluded = true
				}
			},
		},
		hyyzyuanping_info: '渊平|当你使用基本牌后，你可与目标各摸一张牌，或令你出牌阶段使用【杀】的限制次数+1直到你于需要使用【杀】时结束出牌阶段。',
		hyyzyvzhi_info: '雨止|锁定技，当你于回合内使用牌指定目标时，你选择令此牌于此牌点数、目标座次、你的手牌数皆不同时无效，或重铸一张本回合未因此重铸过的非基本牌并将此牌目标改为你本回合上次使用牌唯一目标的下家。',

		hyyz_zzz_die_banyue: ['般岳', ['male', 'hyyz_ys', 4, ['hyyznuxiang', 'hyyzjinchi'], []], '渡夜焚心-玄蝶既白', '来自LB扩展，本设仅供学习使用。想要联机体验完整操作，请前往Q群拉布牌社：467721035。'],
		hyyznuxiang: {
			audio: 3,
			trigger: {
				player: 'useCardAfter'
			},
			filter(event, player) {
				return get.tag(event.card, 'damage') > 0 && player.getStorage('hyyznuxiang', { color: [], num: 0 }).num >= 3
			},
			forced: true,
			async content(event, trigger, player) {
				player.storage.hyyznuxiang ??= { color: [], num: 0 }
				player.storage.hyyznuxiang.num = 0
				player.insertPhase('hyyznuxiang')
				lib.skill.hyyznuxiang.$hyyznuxiang(player)
			},
			mod: {
				cardUsable(card, player, num) {
					if (card.name != 'sha') return;
					const storage = player.getStorage('hyyznuxiang', { color: [], num: 0 }).color.unique()
					if (storage.length == 2) return Infinity
				}
			},
			$hyyznuxiang(player) {
				const map = {
					red: '<span class="firetext">红</span>',
					black: '<span class="bluetext">黑</span>',
				};
				player.addTip('hyyznuxiang', `怒相 ${player.getStorage('hyyznuxiang').color.map(i => map[i])}${player.getStorage('hyyznuxiang').num}`)
			},
			group: ['hyyznuxiang_log'],
			subSkill: {
				log: {
					trigger: {
						player: ['useCard1', 'useCardAfter']
					},
					silent: true,
					charlotte: true,
					filter(event, player) {
						if (event.hyyznuxiang_log) {
							delete event.hyyznuxiang_log
							return false
						}
						return !event.hyyznuxiang_log
					},
					async content(event, trigger, player) {
						trigger.hyyznuxiang_log = true
						player.storage.hyyznuxiang ??= { color: [], num: 0 }
						if (get.tag(trigger.card, 'damage')) {
							player.storage.hyyznuxiang.num++
						}
						if (get.color(trigger.card) != 'none') {
							if (player.storage.hyyznuxiang.color.length >= 3) {
								player.storage.hyyznuxiang.color = player.getStorage('hyyznuxiang').color.slice(-2)
							}
							player.storage.hyyznuxiang.color.push(get.color(trigger.card))
						}
						lib.skill.hyyznuxiang.$hyyznuxiang(player)
					},
				}
			}
		},
		hyyznuxiang_info: '怒相|锁定技，若你使用的上三张牌包含两种颜色，你使用【杀】无次数限制。你每使用三张伤害牌，于当前回合结束后执行一个额外回合。',
		hyyzjinchi: {
			audio: 2,
			limited: true,
			enable: "chooseToUse",
			filter(event, player) {
				return event.type == 'dying' && player.storage.hyyzjinchi == false && _status.event.dying != player;
			},
			filterTarget(card, player, target) {
				return target == _status.event.dying;
			},
			selectTarget: -1,
			async content(event, trigger, player) {
				player.awakenSkill('hyyzjinchi');
				player.addTempSkill('hyyzjinchi_buff');
				await game.changeHpTo(player, Math.max(1, event.target.hp), event.target, player.hp)
			},
			group: 'hyyzjinchi_buff',
			subSkill: {
				buff: {
					trigger: {
						player: ["useCard", "respond"],
					},
					charlotte: true,
					silent: true,
					filter(event, player) {
						return event.respondTo?.length && event.respondTo[1]
					},
					async content(event, trigger, player) {
						/**useCard */
						const evt = trigger.getParent(3);
						trigger.getParent(2).untrigger();
						evt.player = player;
						game.log(player, "成为了", trigger.card, "的使用者");
						game.hyyzSkillAudio('hyyzjinchi', 1, 2)
					}
				}
			},
			ai: {
				order: 6,
				threaten: 1.4,
				skillTagFilter(player) {
					if (!_status.event.dying) return false;
				},
				save: true,
				result: {
					target: 3,
				},
			},
			intro: {
				content: "limited",
			},
		},
		hyyzjinchi_info: '烬叱|限定技，当其他角色进入濒死状态时，你可以与其交换体力值（至多减少至1），若如此做，本局游戏你抵消牌后将此牌使用者改为你。',

		hyyz_xt_die_feixiao: ['飞霄', ['female', 'hyyz_ys', 4, ['hyyzsanwu', 'hyyzxinshou'], ['die:hyyz_xt_sp_feixiao']], '飙驭霆击-玄蝶既白', '来自LB扩展，本设仅供学习使用。想要联机体验完整操作，请前往Q群拉布牌社：467721035。'],
		hyyzsanwu: {
			audio: 5,
			enable: ["chooseToRespond", "chooseToUse"],
			filterCard(card, player) {
				if (get.type2(card) != 'trick') return true;
				if (!player.hasUseTarget(card)) return true
				if (!player.hasHistory('useCard', (evt) => evt.card.name == get.name(card))) return true
				return false
			},
			position: "hes",
			viewAs: {
				name: "sha",
			},
			prompt: "将一张非锦囊牌、未使用过的牌或不能选择目标的牌当【杀】使用或打出",
			check(card) {
				const val = get.value(card);
				if (_status.event.name == "chooseToRespond") {
					return 1 / Math.max(0.1, val);
				}
				return 5 - val;
			},
			async precontent(event, trigger, player) {
				if (lib.skill.hyyzsanwu.canThree(player, event.result.card, event.result.cards)) {
					game.log('#g【三无】', event.result.card, '无次数限制、无距离限制、无视防具牌')
					event.getParent().addCount = false;
				}
			},
			canThree(player, card, cards) {
				if (card.cards || cards) {
					const cardx = (cards ?? card.cards)[0];
					if (
						get.type2(cardx) != 'trick' &&
						!player.hasUseTarget(cardx) &&
						!player.hasHistory('useCard', (evt) => evt.card != card && evt.card.name == get.name(cardx))
					) {
						game.log()
						return true
					}
				}
				return false;
			},
			mod: {
				cardUsable(card, player, num) {
					if (_status.event.skill == 'hyyzsanwu' && lib.skill.hyyzsanwu.canThree(player, card)) {
						return Infinity
					}
				},
				targetInRange(card, player, target) {
					if (_status.event.skill == 'hyyzsanwu' && lib.skill.hyyzsanwu.canThree(player, card)) {
						return true
					}
				},
			},
			ai: {
				unequip: true,
				skillTagFilter(player, tag, arg) {
					if (tag == "unequip") {
						if (_status.event.getParent(2).skill == 'hyyzsanwu' && lib.skill.hyyzsanwu.canThree(player, arg.card)) {
							return true;
						}
						return false
					}
				},
			},
		},
		hyyzxinshou: {
			audio: 2,
			limited: true,
			trigger: {
				player: 'usecardToPlayer',
				target: 'usecardToTarget',
			},
			filter(event, player) {
				return player.hp == 1
			},
			async cost(event, trigger, player) {
				event.result = await trigger.player
					.chooseBool(get.prompt('hyyzxinshou'), '将此牌改为【决斗】')
					.forResult()
			},
			async content(event, trigger, player) {
				player.awakenSkill('hyyzxinshou')
				const card = get.autoViewAs({ name: juedou }, trigger.cards)
				trigger.card = card
				trigger.getParent().card = card

				const target = trigger.player == player ? trigger.target : player;
				await target.addTempSkills('hyyzsanwu')
				await game.changeHpTo(target, player.hp);
				await target.changeCardTo(player.countCards('h'))
			},
		},
		hyyzsanwu_info: '三无|你可以将一张非锦囊牌、未使用过的牌或不能选择目标的牌当【杀】使用或打出，若皆满足则此牌无次数限制、无距离限制、无视防具牌。',
		hyyzxinshou_info: '心狩|限定技，当你指定或成为【杀】的目标时，若你的体力值为1，使用者可以将之改为【决斗】，然后对方将体力值和手牌数调整至与你相同，且本回合视为拥有【三无】。',

		hyyz_ys_die_furina: ['芙宁娜', ['female', 'hyyz_ys', 4, ['hyyzshenlin', 'hyyzjingshui'], ['die:hyyz_ys_furina']], '不休独舞-玄蝶既白', '来自LB扩展，本设仅供学习使用。想要联机体验完整操作，请前往Q群拉布牌社：467721035。'],// 
		hyyzshenlin: {
			audio: 'hyyzshenyi',
			trigger: {
				global: 'roundStart',
			},
			filter(event, player) {
				return player.countCards('he', { type: ['trick', 'delay', 'basic'] }) > 0 &&
					player.getCards('x', (c) => c.hasGaintag('hyyzshenlin_v') || c.hasGaintag('hyyzshenlin_b')).length < 2
			},
			locked: true,
			async cost(event, trigger, player) {
				const tagCards = player.getCards('x', (c) => c.hasGaintag('hyyzshenlin_v') || c.hasGaintag('hyyzshenlin_b'))
				const num = (player.countCards('h', { type: ['basic', 'trick'] }), 2 - tagCards.length)
				event.result = await player.chooseCard('背面朝上移出基本牌或普通锦囊牌', num, true).forResult()
			},
			async content(event, trigger, player) {
				await player.addToExpansion(event.cards, 'give').gaintag.add('hyyzshenlin_b')
				player.markSkill('hyyzshenlin')
			},
			intro: {
				name: '神伶',
				markcount(storage, player) {
					return player.countCards("x", (card) => card.hasGaintag('hyyzshenlin_v') || card.hasGaintag('hyyzshenlin_b'))
				},
				mark(dialog, content, player) {
					const vs = player.getCards("x", (card) => card.hasGaintag('hyyzshenlin_v')),
						bs = player.getCards("x", (card) => card.hasGaintag('hyyzshenlin_b'))
					if (vs.length + bs.length > 0) {
						if (player == game.me || player.isUnderControl()) {
							if (vs.length) {
								dialog.addText('明置神伶牌')
								dialog.addAuto(vs);
							}
							if (bs.length) {
								dialog.addText('暗置神伶牌')
								dialog.addAuto(bs);
							}
						} else {
							if (vs.length) {
								dialog.addText('明置神伶牌')
								dialog.addAuto(vs);
							}
							if (bs.length) {
								dialog.addText('暗置神伶牌')
								dialog.addText(bs.length + '张');
							}
						}
					}
				},
				content(content, player) {
					const vs = player.getCards("x", (card) => card.hasGaintag('hyyzshenlin_v')),
						bs = player.getCards("x", (card) => card.hasGaintag('hyyzshenlin_b'))
					if (vs.length + bs.length > 0) {
						if (player == game.me || player.isUnderControl()) {
							let strs = []
							if (vs.length) {
								strs.add(`明置：${get.translation(vs)}`)
							}
							if (bs.length) {
								strs.add(`暗置：${get.translation(bs)}`)
							}
							return strs.join('<br>')
						} else {
							let strs = []
							if (vs.length) {
								strs.add(`明置：${get.translation(vs)}`)
							}
							if (bs.length) {
								strs.add(`暗置：${bs.length}张`)
							}
						}
					}
				},
			},
			group: 'hyyzshenlin_draw',
			subSkill: {
				draw: {
					silent: true,
					trigger: {
						global: 'useCard'
					},
					usable: 2,
					async content(event, trigger, player) {
						const cards = player.getCards("x", (card) => card.hasGaintag('hyyzshenlin_v') || card.hasGaintag('hyyzshenlin_b'))
						if (cards.some(card => get.suit(card) == get.suit(trigger.card))) {
							await player.draw();
							await player.loseToDiscardpile(cards.filter(card => get.name(card) == get.name(trigger.card)))
							if (player.countCards("x", (card) => card.hasGaintag('hyyzshenlin_v') || card.hasGaintag('hyyzshenlin_b'))) player.markSkill('hyyzshenlin')
							else player.unmarkSkill('hyyzshenlin')
						}
					}
				}
			}
		},
		hyyzshenlin_v: '神伶', hyyzshenlin_b: '神伶',
		hyyzshenlin_info: '神伶|锁定技，每轮开始时，你背面朝上移出基本牌或普通锦囊牌至两张。每回合前两张牌被使用时，若有同花色移出牌，你摸一张牌并移去同名牌。',
		hyyzjingshui: {
			audio: 'hyyzmantian',
			mark: true,
			marktext: "☯",
			zhuanhuanji(player, skill) {
				if (!player.storage[skill]) {//阳=》阴
					player.storage[skill] = true
					lib.skill.hyyzjingshui.zhuSkill = true
					delete lib.skill.hyyzjingshui.forced
					game.filterPlayer(c => {
						if (c.group == 'hyyz_ys') c.addSkill('hyyzjingshui_use')
					});
				} else {//阳《=阴
					delete player.storage[skill]
					delete lib.skill.hyyzjingshui.zhuSkill
					lib.skill.hyyzjingshui.forced = true
					game.filterPlayer(c => { c.removeSkill('hyyzjingshui_use') });
				}
			},
			intro: {
				content(storage, player, skill) {
					return storage ?
						'主公技，崩铁势力角色可以视为使用一张你移出牌中的基本牌。' :
						'锁定技，每轮结束时，若你不为主公，你视为主公直到进入濒死状态，否则明置一张移出牌；若无法明置，失去所有体力。'
				},
			},
			trigger: { global: 'roundEnd' },
			filter(event, player) { return !player.storage.hyyzjingshui },
			forced: true,
			async content(event, trigger, player) {
				player.changeZhuanhuanji('hyyzjingshui')
				if (!player.isZhu) {//变成主公
					lib.skill.hyyzjingshui.toZhu(player, true)
				} else {
					const cards = player.getCards('x', (c) => c.hasGaintag('hyyzshenlin_b'))
					if (cards.length) {
						const next = player.chooseButton(['明置一张移出牌', cards])
						next.set('prompt', '明置一张移出牌')
						next.set('forced', true)
						const { links } = await next.forResult()
						if (links) {
							links[0].gaintag.remove('hyyzshenlin_b')
							links[0].gaintag.add('hyyzshenlin_v')
							game.log(player, '明置了', links[0])
							player.markSkill('hyyzshenlin')
						}
					} else {
						await player.loseHp(player.hp)
					}
				}
			},
			subSkill: {
				use: {
					enable: "chooseToUse",
					filter(event, player) {
						return game.hasPlayer(current => {
							if (!current.hasZhuSkill('hyyzjingshui')) return false;
							if (!current.hasSkill('hyyzshenlin')) return false;
							const cards = current.getCards('x', card => (card.hasGaintag('hyyzshenlin_v') || card.hasGaintag('hyyzshenlin_b')) && get.type(card) == 'basic');
							if (cards.some(card => event.filterCard({ name: card.name, isCard: true }, player, event))) return true;
						})
					},
					chooseButton: {
						dialog(event, player) {
							let names = [];
							game.filterPlayer(current => {
								if (!current.hasZhuSkill('hyyzjingshui')) return false;
								if (!current.hasSkill('hyyzshenlin')) return false;
								const cards = current.getCards('x', card => (card.hasGaintag('hyyzshenlin_v') || card.hasGaintag('hyyzshenlin_b')) && get.type(card) == 'basic');
								for (let card of cards) {
									if (event.filterCard({ name: card.name, isCard: true }, player, event)) names.add(card.name)
								}
							})
							let vcards = names.unique().map(name => ['基本', '', name])
							var dialog = ui.create.dialog("镜水", [vcards, "vcard"], "hidden");
							dialog.direct = true;
							return dialog;
						},
						backup(links, player) {
							return {
								filterCard: () => false,
								selectCard: -1,
								viewAs: {
									name: links[0][2],
									isCard: true,
								},
								popname: true,
								async precontent(event, trigger, player) {
									const target = game.findPlayer(i => i.hasSkill('hyyzjingshui'))
									player.logSkill("hyyzjingshui", target);
									//转换回去
									target.changeZhuanhuanji('hyyzjingshui')
									//取消主公
									await event.trigger('hyyzjingshui_use')
								},
							};
						},
						prompt(links, player) {
							return "镜水：视为使用一张【" + get.translation(links[0][2]) + "】";
						},
					},
					hiddenCard(player, name) {
						const players = game.filterPlayer(current =>
							current.hasZhuSkill('hyyzjingshui') &&
							current.hasSkill('hyyzshenlin') &&
							current.countCards('x', card => (card.hasGaintag('hyyzshenlin_v') || card.hasGaintag('hyyzshenlin_b')))
						);
						if (!players.length) return false;
						return get.type(name) == 'basic'
					}
				},
				re: {
					trigger: {
						player: 'dyingBegin',
						global: 'hyyzjingshui_use'
					},
					silent: true,
					charlotte: true,
					filter(event, player) {
						return player.isZhu
					},
					async content(event, trigger, player) {
						lib.skill.hyyzjingshui.toZhu(player, false)
					},
				}
			},
			//变成主公或者凡人
			toZhu(player, bool) {
				if (bool) {
					player.say('登神')
					player.isZhu = true
					player.addSkill('hyyzjingshui_re')

					player.storage.hyyzjingshui_re = game.zhu
					game.zhu.identity = player.identity
					player.identity = "zhu";
					player.showIdentity();
					game.zhu.showIdentity();
					player.update();
					game.zhu.update();
				} else {
					player.say('卸任')
					delete player.isZhu
					player.removeSkill('hyyzjingshui_re')

					player.identity = player.storage.hyyzjingshui_re.identity
					player.storage.hyyzjingshui_re.identity = 'zhu'
					player.showIdentity();
					player.storage.hyyzjingshui_re.showIdentity();
					player.update();
					player.storage.hyyzjingshui_re.update();
				}
			},
		},
		hyyzjingshui_info: '镜水|转换技，阳：锁定技，每轮结束时，若你不为主公，你视为主公直到进入濒死状态，否则明置一张移出牌；若无法明置，失去所有体力。阴：主公技，原神势力角色可以视为使用一张你移出牌中的基本牌。',

	}
}, dynamicTranslates = {
	hyyzjingshui(player) {
		const bool = player.storage.hyyzjingshui;
		let 前言 = '转换技，',
			阳 = "锁定技，每轮结束时，若你不为主公，你视为主公直到进入濒死状态，否则明置一张移出牌，若无法明置，失去所有体力",
			阴 = "主公技，原神势力角色可以视为使用一张你移出牌中的基本牌",
			后语 = '。'
		if (bool) {
			阴 = `<span class='bluetext'>${阴}</span>`;
		} else {
			阳 = `<span class='firetext'>${阳}</span>`;
		}
		return `${前言}阳：${阳}；阴：${阴}${后语}`;
	},
};
export { characters, dynamicTranslates }