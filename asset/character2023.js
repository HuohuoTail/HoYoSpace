'use strict';
import { lib, game, ui, get, ai, _status } from '../../../noname.js';
//技能等相关信息
/**@type { SMap < SMap< [String, Character, String, String] | Skill | String>> } */
const characters = {
	2306: {
		hyyz_xt_jingyuan: ['景元', ["male", "hyyz_xt", 4, ["hyyzshenjun", "hyyzzhankan", "hyyzshence"], ['zhu', 'name:景|元']], '紫灵谷的骊歌', '仙舟联盟帝弓七天将之一，负责节制罗浮云骑军的「神策将军」。师从前代「罗浮」剑首，但并不显名于武力。'],
		hyyzshenjun: {
			init: (player) => player.storage.hyyzshenjun = 0,
			audio: 2,
			mark: true,
			marktext: "君",
			intro: {
				name: "神霄雷府总司驱雷掣电追魔扫秽天君",
				content(storage) {
					let str = '神霄雷府总司驱雷掣电追魔扫秽天君的段数为：<br>';
					if (!storage) return str += '0';
					return str + storage;
				},
			},
			trigger: {
				player: ["useCard", "respond"],
			},
			forced: true,
			filter(event, player) {
				return event.card && get.type2(event.card) && player.storage.hyyzshenjun < 10;
			},
			async content(event, trigger, player) {
				let num = 0;
				switch (get.type2(trigger.card)) {
					case 'basic': num = 1; break;
					case 'trick': num = 2; break;
					case 'equip': num = 3; break;
				};
				player.storage.hyyzshenjun += num;
				if (player.storage.hyyzshenjun > 10) player.storage.hyyzshenjun = 10;
				player.syncStorage('hyyzshenjun');
			},
		},
		hyyzzhankan: {
			audio: 2,
			trigger: {
				player: "phaseUseBegin",
			},
			forced: true,
			filter(event, player) {
				return player.storage.hyyzshenjun >= 3;
			},
			async content(event, trigger, player) {
				game.hyyzSkillAudio('hyyzzhankan', 1)
				let bool = false;
				game.delay(1.5);
				do {
					if (!bool) {
						game.hyyzSkillAudio('hyyzzhankan', 2)
						bool = true;
					}
					player.storage.hyyzshenjun -= 3;
					player.syncStorage('hyyzshenjun');
					const { targets } = await player.chooseTarget(true, lib.filter.notMe)
						.set('ai', (target) => get.damageEffect(target, player, player, 'thunder'))
						.set('prompt', '斩勘：对一名其他角色造成1点雷电伤害')
						.forResult();
					if (targets) {
						player.line(targets[0], 'thunder');
						targets[0].damage(player, 'thunder');
					}
					else return;
				} while (player.storage.hyyzshenjun >= 3);
			},
			ai: {
				combo: 'hyyzshenjun',
				threaten: 3,
				expose: 1,
			},
		},
		hyyzshence: {
			audio: 4,
			zhuSkill: true,
			unique: true,
			forced: true,
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			filter(event, player) {
				if (!player.hasZhuSkill('hyyzshence')) return false;
				if (event.player.group != 'hyyz_xt') return false;
				return player.storage.hyyzshenjun < 10 && (event.name != 'phase' || game.phaseNumber == 0);
			},
			async content(event, trigger, player) {
				let num = game.countPlayer((current) => current.group == 'hyyz_xt');
				num = Math.min(num, 10 - player.storage.hyyzshenjun);
				if (num > 0) {
					player.storage.hyyzshenjun += num;
					player.syncStorage('hyyzshenjun');
					game.log('#g【神策】', '“神君”增加', num, '段');
				}
			},
			ai: {
				combo: 'hyyzshenjun',
			}
		},
		hyyzshenjun_info: "神君|锁定技，当你使用或打出基本/锦囊/装备牌时，〖神君〗增加1/2/3段（至多10段）。",
		hyyzzhankan_info: "斩勘|锁定技，出牌阶段开始时，你减少三段〖神君〗并对一名其他角色造成1点雷电伤害，然后重复此流程。",
		hyyzshence_info: "神策|主公技，锁定技，游戏开始时，场上每有一名星铁势力的角色，〖神君〗增加1段。",

		hyyz_xt_qingque: ['青雀', ["female", "hyyz_xt", 3, ["hyyzlaoyue", "hyyzmenqing", "hyyzangang"], []], '紫灵谷的骊歌', '仙舟「罗浮」太卜司的卜者，兼书库管理员。因工作一再偷闲摸鱼，即将贬无可贬成为「掌门人」。'],
		hyyzqiongyu: {
			charlotte: true,
			unique: true,
			intro: {
				markcount: "expansion",
				mark(dialog, content, player) {
					var content = player.getExpansions('hyyzqiongyu');
					if (content && content.length) {
						if (player == game.me || player.isUnderControl()) {
							dialog.addAuto(content);
						}
						else {
							return '共有' + get.cnNumber(content.length) + '张“琼玉牌”';
						}
					}
				},
				content(content, player) {
					var content = player.getExpansions('hyyzqiongyu');
					if (content && content.length) {
						if (player == game.me || player.isUnderControl()) {
							return get.translation(content);
						}
						return '共有' + get.cnNumber(content.length) + '张“琼玉牌”';
					}
				},
			},
			onremove(player, skill) {
				var cards = player.getExpansions(skill);
				if (cards.length) player.loseToDiscardpile(cards);
			},
		},
		hyyzlaoyue: {
			audio: 11,
			frequent: 'hyyzlaoyue_phase',
			group: ["hyyzlaoyue_phase", "hyyzlaoyue_lose", "hyyzlaoyue_four", "hyyzqiongyu"],
			subSkill: {
				phase: {
					trigger: {
						global: "phaseBegin",
					},
					frequent: true,
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyzlaoyue', 1, 2, 3, 4, 5)
						player.addToExpansion(get.cards(), player, 'draw').gaintag.add('hyyzqiongyu');
						game.log(player, '增加一张“琼玉牌”');
					},
				},
				lose: {
					enable: "phaseUse",
					filter: (event, player) => player.countCards('he') > 0,
					filterCard: true,
					position: "he",
					check: (card) => 8 - get.value(card),
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyzlaoyue', 6, 7, 8, 9, 10, 11)
						player.addToExpansion(get.cards(2), player, 'draw').gaintag.add('hyyzqiongyu');
						game.log(player, '增加两张“琼玉牌”');
					},
					ai: {
						order: 3,
						result: {
							player(player, target) {
								if (player.countCards('h') < player.hp) return -2;
								if (player.countCards('h') > player.hp) return 1;
							},
						},
					},
				},
				four: {
					trigger: {
						player: ["addToExpansionAfter", "loseToDiscardpile"],
					},
					filter(event, player, name) {
						return player.getExpansions('hyyzqiongyu').length >= 4;
					},
					direct: true,
					silent: true,
					charlotte: true,
					filter(event, player, name) {
						return player.getExpansions('hyyzqiongyu').length > 4;
					},
					async content(event, trigger, player) {
						var num = player.getExpansions('hyyzqiongyu').length - 4;
						let { links } = await player
							.chooseCardButton('弃置' + get.cnNumber(num) + '张“琼玉牌”', player.getExpansions('hyyzqiongyu'), true, num)
							.set('ai', (button) => get.type(button.link) != 'basic')
							.forResult();
						if (links) {
							player.loseToDiscardpile(links);
							game.log(player, '弃置', get.cnNumber(links.length), '张“琼玉牌”');
						}
					}
				}
			},
			ai: {
				combo: "hyyzangang",
			}
		},
		hyyzmenqing: {
			audio: 2,
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				return player.getExpansions('hyyzqiongyu').length && event.filterCard({ name: 'sha' }, player, event);
			},
			hiddenCard(player, name) {
				return name == 'sha' && player.getExpansions('hyyzqiongyu').length > 0;
			},
			chooseButton: {
				dialog(event, player) {
					return ui.create.dialog('门清', player.getExpansions('hyyzqiongyu'), 'hidden');
				},
				filter(button, player) {
					var evt = _status.event.getParent();
					var card = get.autoViewAs({ name: 'sha' }, [button.link]);
					return evt.filterCard(card, player, evt);
				},
				select: 1,
				check(button) {
					var player = _status.event.player;
					return get.type2(button.link) != 'basic';
				},
				backup(links, player) {
					return {
						audio: "hyyzmenqing",
						filterCard: links[0],
						selectCard: -1,
						position: 'x',
						viewAs: {
							name: 'sha',
						},
						onuse(result, player) {
							player.logSkill('hyyzmenqing', result.targets);
						},
						onrespond(result, player) {
							player.logSkill('hyyzmenqing');
						}
					};
				},
				prompt(links, player) {
					return '选择杀（' + get.translation(links[0]) + '）的目标';
				},
			},
			ai: {
				combo: "hyyzlaoyue",
				order(item, player) {
					if (player.getExpansions('hyyzqiongyu').length >= 3) return 6;
					return 1;
				},
				respondSha: true,
				skillTagFilter(player, tag, arg) {
					return player.getExpansions('hyyzqiongyu').length > 0;
				},
			},
			mod: {
				targetInRange(card) {
					if (_status.event.skill == 'hyyzmenqing_backup') return true;
				},
			},
			group: "hyyzqiongyu",
		},
		hyyzangang: {
			audio: 2,
			group: ["hyyzqiongyu", "hyyzangang_audio"],
			subSkill: {
				audio: {
					trigger: {
						player: ["addToExpansionAfter", "loseToDiscardpile"],
					},
					filter(event, player, name) {
						return player.getExpansions('hyyzqiongyu').length == 4 &&
							player.getExpansions('hyyzqiongyu').every(val => get.type2(player.getExpansions('hyyzqiongyu')[0]) == get.type2(val));
					},
					async cost(event, trigger, player) {
						game.hyyzSkillAudio('hyyzangang', 1)
						const result = await player.chooseTarget('对一名其他角色造成2点伤害', lib.filter.notMe, true)
							.set('ai', (target) => -get.attitude(_status.event.player, target)).forResult()
						event.result = result;
					},
					logTarget: 'targets',
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyzangang', 2)
						await player.loseToDiscardpile(player.getExpansions('hyyzqiongyu'));
						event.targets[0].damage(2);
					},
				}
			},
			ai: {
				combo: "hyyzlaoyue",
			}
		},
		hyyzqiongyu: "琼玉牌",
		hyyzlaoyue_info: "捞月|你可以于{每回合开始时/出牌阶段弃置一张牌}，将牌堆顶的{一/二}张牌加入“琼玉牌”并弃置至四张。",
		hyyzmenqing_info: "门清|你可以将一张“琼玉牌”当无距离限制的【杀】使用或打出。",
		hyyzangang_info: "暗杠|锁定技，若“琼玉牌”为四张类型相同的牌，弃置所有“琼玉牌”并对一名其他角色造成两点伤害。",

		hyyz_xt_bailu: ['白露', ["female", "hyyz_xt", 3, ["hyyzleiyin", "hyyzxuanhu"], []], '紫灵谷的骊歌', '仙舟「罗浮」持明族的尊长，有「衔药龙女」之称的医士。以独门医理和唯有龙脉方可施行的「医疗手段」救死扶伤。'],
		hyyzleiyin: {
			audio: 2,
			enable: 'phaseUse',
			usable: 1,
			filter(event, player) {
				return player.countCards('he');
			},
			filterCard: true,
			check(card) {
				if (ui.selected.cards.length) return -1;
				return 8 - get.value(card);
			},
			selectCard: [1, 3],
			position: 'he',
			filterTarget: true,
			selectTarget() {
				return ui.selected.cards.length;
			},
			async content(event, trigger, player) {
				const target = event.target;
				const cards = await target
					.draw()
					.forResult();
				target.addSkills('hyyzshengxi')
				if (get.color(cards[0]) == 'red') {
					let next = target.chooseUseTarget();
					next.cards = cards;
					next.card = get.autoViewAs({ name: 'tao' }, cards);
					next.targets = [target];
					next.prompt = `是否对自己使用${get.translation(get.autoViewAs({ name: 'tao' }, cards))}（${get.translation(cards)}）？`
					await next;
				}
			},
			ai: {
				order: 10,
				result: {
					target: 2,
				},
			},
			derivation: 'hyyzshengxi',
		},
		hyyzshengxi: {
			audio: 2,
			mark: true,
			marktext: "生",
			intro: {
				name: "生息",
				content: "你受到伤害后，回复1点体力并失去此技，当前回合结束后，减2点体力上限",
			},
			init(player) {
				player.gainMaxHp(2);
			},
			onremove(player) {
				player.when({ global: 'phaseAfter' }).then(() => (player.loseMaxHp(2)));
			},
			trigger: {
				player: "damageEnd",
			},
			forced: true,
			async content(event, trigger, player) {
				await player.recover();
				await player.removeSkills('hyyzshengxi')
			},
			ai: {
				maixie: true,
				"maixie_hp": true,
			},
		},
		hyyzxuanhu: {
			audio: 1,
			enable: "chooseToUse",
			filter(event, player) {
				return event.type == 'dying' && player.storage.hyyzxuanhu == false && _status.event.dying != player;
			},
			filterTarget(card, player, target) {
				return target == _status.event.dying;
			},
			selectTarget: -1,
			mark: true,
			skillAnimation: true,
			animationStr: "悬壶",
			limited: true,
			animationColor: "wood",
			init(player) {
				player.storage.hyyzxuanhu = false;
			},
			async content(event, trigger, player) {
				player.awakenSkill('hyyzxuanhu');
				player.storage.hyyzxuanhu = true;
				let count = player.maxHp;
				while (count > 0) {
					count--;
					await player.useSkill('hyyzleiyin', event.targets);
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
					target: 6,
				},
			},
			intro: {
				content: "limited",
			},
		},
		hyyzleiyin_info: "雷音|出牌阶段限一次，你可以弃置至多三张牌，令等量的角色各摸一张牌并获得〖生息〗，因此获得红色牌的角色可以将此牌当【桃】使用。",
		hyyzshengxi_info: '生息|锁定技，获得此技时加2点体力上限。你受到伤害后，回复1点体力并失去此技，当前回合结束后，减2点体力上限。',
		hyyzxuanhu_info: "悬壶|限定技，一名其他角色进入濒死时，你可以对其发动体力上限次〖雷音〗。",

	},
	2307: {
		hyyz_xt_luocha: ['罗刹', ["male", "hyyz_xt", 3, ["hyyzzanghua", "hyyzxuanxin"], ['zhu',]], '紫灵谷的骊歌', '金发俊雅的年轻人，背着巨大的棺棹。身为天外行商的他，不幸被卷入仙舟「罗浮」的星核危机，一身精湛医术莫名有了用武之地。'],
		hyyzzanghua: {
			audio: 5,
			logAudio(event, player) {
				return player.storage.hyyzzanghua ? [
					'ext:忽悠宇宙/asset/character/audio/hyyzzanghua3.mp3',
					'ext:忽悠宇宙/asset/character/audio/hyyzzanghua4.mp3',
					'ext:忽悠宇宙/asset/character/audio/hyyzzanghua5.mp3',
				] : [
					'ext:忽悠宇宙/asset/character/audio/hyyzzanghua1.mp3',
					'ext:忽悠宇宙/asset/character/audio/hyyzzanghua2.mp3',
				]
			},
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				markcount(storage, player) {
					return storage ? '灭' : '救';
				},
				content(storage, player, skill) {
					return storage ?
						`一名角色造成伤害后，若其的体力值大于一半，其${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。` :
						`一名角色受到伤害后，若其的体力值小于一半，其${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。`;
				},
			},
			trigger: {
				global: 'damageAfter'
			},
			filter(event, player) {
				if (player.storage.hyyzzanghua) {
					return event.source && event.source.hp > event.source.getDamagedHp();
				} else {
					return event.player.hp < event.player.getDamagedHp();
				}
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseBool()
					.set('prompt', `是否对${player.storage.hyyzzanghua ? get.translation(trigger.source) : get.translation(trigger.player)}发动${get.translation('hyyzzanghua')}？`)
					.set('prompt2', player.storage.hyyzzanghua ?
						`${get.translation(trigger.source)}${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。` :
						`${get.translation(trigger.player)}${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。`)
					.set('ai', () => player.storage.hyyzzanghua ? get.attitude2(trigger.source) < 0 : get.attitude2(trigger.player) > 0)
					.forResult();
				event.result.targets = player.storage.hyyzzanghua ? [trigger.source] : [trigger.player];
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const storage = player.storage.hyyzzanghua ? true : false;
				player.changeZhuanhuanji('hyyzzanghua');
				player.updateMark('hyyzzanghua')
				if (storage) {
					await trigger.source.hyyzQvsan();
					while (trigger.source.hp >= trigger.source.getDamagedHp()) {
						await trigger.source.loseHp();
					}
				} else {
					await trigger.player.hyyzJinghua()
					while (trigger.player.hp <= trigger.player.getDamagedHp()) {
						await trigger.player.recover();
					}
				}
			},
		},
		hyyzxuanxin: {
			audio: 2,
			trigger: {
				global: 'roundStart'
			},
			async content(event, trigger, player) {
				player.changeZhuanhuanji('hyyzzanghua');
				player.updateMark('hyyzzanghua');
				await game.delayx();
				let list = [];
				if (lib.inpile.some(name => get.translation(name).includes('黑渊'))) list.add(['装备', '', 'hyyz_heiyuan']);
				if (lib.inpile.some(name => get.translation(name).includes('白花'))) list.add(['装备', '', 'hyyz_baihua']);
				if (!list.length) return;
				const { links } = await player.chooseButton(['选择要装备的牌', [list, 'vcard']], true)
					.set('ai', (button) => {
						const name = button.link[2];
						if (player.getEquips('hyyz_heiyuan').length) return name == 'hyyz_baihua';
						if (player.getEquips('hyyz_baihua').length) return name == 'hyyz_heiyuan';
						return true;
					})
					.forResult();
				if (links) {
					const name = links[0][2];
					let card, target;
					card = get.cardPile((card) => card.name.includes(name));
					if (!card) {
						let players = game.filterPlayer();
						for (let current of players) {
							if (current.countCards('hej', (card) => card.name.includes(name))) {
								card = current.getCards('hej', (card) => card.name.includes(name))[0];
								target = current;
							};
							if (card) break;
						}
					}
					if (card) {
						player.equip(card);
					}
					else game.log(name, '不在游戏中');

					if (target?.isIn()) {
						const { index } = await player
							.chooseControlList([
								`${get.translation(target)}${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。`,
								`${get.translation(target)}${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。`,
							])
							.set('prompt', '你可以对' + get.translation(target) + '发动一次葬花')
							.set('ai', () => get.attitude2(target) > 0 ? 1 : 0)
							.forResult();
						if (index == 0) {
							game.hyyzSkillAudio('hyyzzanghua', 3, 4, 5)
							await target.hyyzQvsan();
							while (target.hp >= target.getDamagedHp()) {
								await target.loseHp();
							}
						} else if (index == 1) {
							game.hyyzSkillAudio('hyyzzanghua', 1, 2)
							await target.hyyzJinghua();
							while (target.hp <= target.getDamagedHp()) {
								await target.recover();
							}
						}
					}
				}
			},
		},
		hyyzzanghua_info: `葬花|转换技：<br>
			阳：体力值小于一半的角色受到伤害后，若，可令其${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。<br>
			阴：体力值大于一半的角色造成伤害后，若，可令其${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。`,
		hyyzxuanxin_info: '悬心|每轮开始时，你可以转换〖葬花〗并装备一张名字包含“黑渊”或“白花”的牌。若此牌在角色的区域内，你可以对其发动一项〖葬花〗。',

		hyyz_xt_welt: ['瓦尔特', ["male", "hyyz_xt", 4, ["hyyzduanjie", "hyyzshenpan"], ['zhu',]], '紫灵谷的骊歌', '老成持重的列车组前辈。享受着久违的冒险奇遇，心底埋藏的热血再度燃烧，偶尔还会将经历的冒险旅程画在本子里。'],
		hyyzduanjie: {
			audio: 3,
			trigger: {
				player: "useCardToPlayered",
			},
			filter(event, player) {
				return event.card.name == 'sha' && event.target != player && !event.target.hashyyzBuff('hyyzBuff_jingu');
			},
			shaRelated: true,
			forced: true,
			logTarget: "target",
			async content(event, trigger, player) {
				trigger.target.addhyyzBuff('hyyzBuff_jingu');
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (card.name == 'sha') return [1, 2];
					},
				},
				"unequip_ai": true,
				skillTagFilter(player, tag, arg) {
					if (tag == 'unequip_ai' && arg && arg.name == 'sha' && arg.target) return true;
					return false;
				},
			},
		},
		hyyzshenpan: {
			audio: 3,
			frequent: 'hyyzshenpan_dam',
			group: ["hyyzshenpan_dam", "hyyzshenpan_lose"],
			subSkill: {
				dam: {
					trigger: {
						source: "damageSource",
					},
					check(event, player) {
						return -get.attitude(player, event.player)
					},
					frequent: "check",
					filter(event, player) {
						return !event.player.hashyyzBuff('hyyzBuff_jiansu') && event.player.isAlive();
					},
					usable: 1,
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyzshenpan', 1)
						player.logSkill('hyyzshenpan_dam', trigger.player);
						trigger.player.addhyyzBuff('hyyzBuff_jiansu');
					},
				},
				lose: {
					trigger: {
						global: ["loseAfter"]
					},
					filter(event, player) {
						if (!event.player.hashyyzBuff('hyyzBuff_jingu')) return false;
						if (event.player == player) return false;
						if (event.type != 'discard' || event.getlx === false) return false;
						var evt = event.getl(event.player);
						if (evt && evt.cards && evt.cards.length) {
							for (var i of evt.cards) {
								if (i.original != 'j' && get.position(i, true) == 'd') {
									return true;
								}
							}
							return false;
						}
					},
					async cost(event, trigger, player) {
						game.hyyzSkillAudio('hyyzshenpan', 2)
						let cards = [];
						for (let i of trigger.getl(trigger.player).cards) {
							if (get.position(i) == 'd') cards.add(i);
						}
						let { bool, links } = await player.chooseButton(['审判：获得其中一张牌，然后可以对' + get.translation(trigger.player) + '使用此牌', cards], (button) => {
							return _status.event.player.getUseValue(button.link) || get.value(button.link);
						}).forResult()
						event.result = {
							bool: bool,
							cards: links
						}
					},
					logTarget: 'player',
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyzshenpan', 3)
						player.gain(event.cards[0], 'gain2');
						if (player.canUse(event.cards[0], trigger.player, false)) {
							let { bool } = await player
								.chooseBool('是否对' + get.translation(trigger.player) + '使用' + get.translation(event.cards[0]) + '？')
								.forResult();
							if (bool) player.useCard(event.cards[0], trigger.player);
						}
					},
				},
			},
		},
		hyyzduanjie_info: `断界|锁定技，当你使用【杀】指定目标后，令目标角色${get.hyyzIntroduce('禁锢')}。`,
		hyyzshenpan_info: `审判|你对其他角色造成伤害后，你可以令其${get.hyyzIntroduce('减速')}。被${get.hyyzIntroduce('禁锢')}的角色的牌因弃置进入弃牌堆后，你获得其中一张牌，然后你可以对其使用此牌。`,

		hyyz_xt_yinlang: ['银狼', ["female", "hyyz_xt", 3, ["hyyzhuiya", "hyyzruqin", "hyyzfengjin"], []], '紫灵谷的骊歌', '「星核猎手」的成员，骇客高手。将宇宙视作大型沉浸式模拟游戏，玩乐其中。掌握了能够修改现实数据的「以太编辑」。'],
		hyyzhuiya: {
			audio: 2,
			trigger: {
				player: "useCardToPlayered",
			},
			filter(event, player) {
				if (_status.currentPhase != player || !player.isPhaseUsing()) return false;
				return event.target != player
			},
			usable: 1,
			logTarget: "target",
			check(event) {
				return -get.attitude2(event.target)
			},
			async content(event, trigger, player) {
				trigger.getParent().directHit.addArray(game.filterPlayer());

				const weakness = get.weakness().filter(i => !trigger.target.hasWeakness(i));
				if (weakness.length) {
					const { control } = await player
						.chooseControl(weakness.map(i => i + '_logo'))
						.set('prompt', '植入一个弱点')
						.set('ai', () => {
							return weakness.map(i => i + '_logo')[0];
						})
						.forResult();
					if (control) {
						await trigger.target.addWeakness(control.slice(0, -5));
					}
				}
			},
		},
		hyyzruqin: {
			audio: 3,
			trigger: {
				player: ['useCardBefore', 'respondBefore']
			},
			locked: false,
			forced: true,
			firstDo: true,
			filter(event, player) {
				let cards = player.getCards("s", card => {
					return card.gaintag.some(tag => tag.startsWith('hyyzruqin')) && card._cardid;
				});
				return event.cards && event.cards.some(card => cards.includes(card));
			},
			async content(event, trigger, player) {
				const idList = player.getCards("s", card => card.gaintag.some(tag => tag.startsWith('hyyzruqin'))).map(i => i._cardid);
				let current_cards = [];
				game.countPlayer(current => {
					current_cards.addArray(current.getCards('h', (card) => idList.includes(card.cardid)))
				})

				let trigger_cards = [];
				for (let i of trigger.cards) {
					let cardx = current_cards.find(card => card.cardid == i._cardid);
					if (cardx) trigger_cards.add(cardx);
				}

				let old_cards = trigger.cards.slice();
				trigger.cards = trigger_cards;
				trigger.card.cards = trigger_cards;

				if (player.isOnline2()) {
					player.send((cards, player) => {
						cards.forEach(i => i.delete());
						if (player == game.me) ui.updatehl();
					}, old_cards, player);
				}
				old_cards.forEach(i => i.delete());
				if (player == game.me) ui.updatehl();
			},
			global: 'hyyzruqin_other',
			subSkill: {
				other: {
					trigger: {
						global: ["phaseBefore", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter", "changeWeaknessAfter"],
						player: ["enterGame", "loseAfter", "die"],
					},
					forceDie: true,
					priority: -50,
					forced: true,
					charlotte: true,
					silent: true,
					filter(event, player, name) {
						if (event.name == 'changeWeakness') return true;
						if (!player.isMaxWeakness()) return false;
						//游戏开始时初始化
						if (event.name == 'die') return true;
						if (name == 'enterGame' || name == 'phaseBefore') {
							return event.name != 'phase' || game.phaseNumber == 0;
						}
						if (event.name == 'gain' && event.player == player) {
							return true//player.isMaxWeakness()
						}
						const evt = event.getl(player);
						if (!evt || !evt.hs || !evt.hs.length) return false;
						return true;
					},
					async content(event, trigger, player) {
						const targets = game.filterPlayer(current => current != player && current.hasSkill('hyyzruqin'));
						for (let target of targets) {
							const tag = 'hyyzruqin_' + player.name;
							lib.translate[tag] = '' + lib.translate[player.name].slice(0, 4);
							const cardsx = player.isMaxWeakness() ? player.getCards('h').map((card) => {
								let cardx = ui.create.card();
								cardx.init(get.cardInfo(card));
								cardx._cardid = card.cardid;
								return cardx;
							}) : [];
							target.getCards('s', card => card.hasGaintag(tag)).filter(i => !cardsx.includes(i)).forEach(i => i.delete());
							if (!target.countCards('s', card => card.hasGaintag(tag))) target.directgains(cardsx, null, tag);
						}
					},
				}
			},
			mod: {
				cardEnabled2(card, player) {
					if (card.gaintag?.some(tag => tag.startsWith('hyyzruqin')) && _status.currentPhase == player) return false;
				},
			},
		},
		hyyzfengjin: {
			audio: 2,
			trigger: {
				source: "damageEnd",
			},
			check(event, player) {
				return get.attitude(player, event.player) <= 0;
			},
			filter(event, player) {
				if (event.player.hashyyzBuff('hyyzBuff_zhongshang') &&
					event.player.hashyyzBuff('hyyzBuff_xuruo') &&
					event.player.hashyyzBuff('hyyzBuff_jiansu')) return false;
				return event.player != player && event.player.isIn();
			},
			async cost(event, trigger, player) {
				let list = ['hyyzBuff_zhongshang', 'hyyzBuff_xuruo', 'hyyzBuff_jiansu'].filter(skill => !trigger.player.hashyyzBuff(skill));
				let { control } = await player
					.chooseControl(list, 'cancel2')
					.set('prompt', '封禁：是否令' + get.translation(trigger.player) + '获得一个debuff？')
					.set('ai', () => {
						const trigger = _status.event.getTrigger();
						if (get.attitude2(trigger.player) < 0) {
							return list.randomGet()
						}
						return 'cancel2'
					})
					.forResult();
				event.result = {
					bool: control != 'cancel2',
					cost_data: control,
				}
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.addhyyzBuff(event.cost_data);
			},
		},
		hyyzhuiya_info: `绘鸦|出牌阶段限一次，你使用牌指定其他角色后，可以为其植入一个自身没有的${get.hyyzIntroduce('弱点')}，且此牌不能被响应。`,
		hyyzruqin_info: "入侵|回合外，你可以使用或打出弱点最多的角色的手牌。",
		hyyzfengjin_info: `封禁|当你造成伤害后，你可以令受伤角色获得${get.hyyzIntroduce('减速')}、${get.hyyzIntroduce('虚弱')}或${get.hyyzIntroduce('重伤')}。`,

		hyyz_xt_jizi: ['姬子', ["female", "hyyz_xt", 4, ["hyyzzhuiji", "hyyzxinghuo", "hyyztianhuo"], ['zhu',]], '紫灵谷的骊歌', '星穹列车的修复者。为了见证广阔的星空，选择与星穹列车同行。爱好是制作手调咖啡。'],
		hyyzzhuiji: {
			audio: 4,
			group: 'hyyzzhuiji_audio',
			subSkill: {
				audio: {
					trigger: {
						player: "damageEnd",
						source: "damageSource",
					},
					filter(event, player) {
						return event.player.countDiscardableCards(player, "e") > 0;
					},
					async cost(event, trigger, player) {
						const result = await player.discardPlayerCard(get.prompt('hyyzzhuiji', trigger.player), trigger.player, 'e',)
							.set('ai', function (button) {
								const trigger = _status.event.getTrigger();
								const target = trigger.player, player = _status.event.player;
								const att = get.attitude(player, target);
								if (player.hp <= 2 && target == player) return 12 - get.value(button.link);
								if (att > 0) return 8 - get.value(button.link);
								return 0.1 + get.value(button.link);
							}).forResult()
						event.result = result
					},
					logTarget: 'player',
					async content(event, trigger, player) {
						if (trigger.player == player) {
							game.hyyzSkillAudio('hyyzzhuiji', 1, 2)
						} else {
							game.hyyzSkillAudio('hyyzzhuiji', 3, 4)
						}
					},
				}
			},
		},
		hyyzxinghuo: {
			audio: 4,
			marktext: "星",
			intro: {
				content: "expansion",
				markcount: "expansion",
			},
			onremove(player, skill) {
				var cards = player.getExpansions(skill);
				if (cards.length) player.loseToDiscardpile(cards);
			},
			group: 'hyyzxinghuo_audio',
			subSkill: {
				audio: {
					trigger: {
						global: ["loseAsyncAfter", "loseAfter"],
					},
					filter(event, player) {
						if (event.type != 'discard' || event.getlx === false) return;
						var evt = event.getl(event.player);
						for (var i = 0; i < evt.cards2.length; i++) {
							if (get.type(evt.cards2[i]) == 'equip' && get.position(evt.cards2[i]) == 'd') {
								return true;
							}
						}
						return false;
					},
					async cost(event, trigger, player) {
						let cards = [];
						let evt = trigger.getl(trigger.player);
						for (let i = 0; i < evt.cards2.length; i++) {
							if (get.type(evt.cards2[i]) == 'equip' && get.position(evt.cards2[i]) == 'd') {
								cards.add(evt.cards2[i]);
							}
						}
						let str = [
							'令' + get.translation(trigger.player) + '[灼烧]',
							'将' + get.translation(cards) + '置于武将牌上并摸一张牌'];
						let { index } = await player.chooseControlList('星火', str, function () {
							var player = _status.event.player, target = _status.event.target;
							if (target.hasSkillTag('nofire')) return 1;
							if (get.attitude(player, target) < 0) {
								if (target.hp <= 1) return 1;
							}
							return 1;
						})
							.set('target', trigger.player).forResult()
						event.result = {
							bool: (index == 0 || index == 1),
							cards: cards,
							cost_data: {
								index: index
							}
						}
					},
					logTarget: 'player',
					async content(event, trigger, player) {
						if (event.cost_data.index == 0) {
							trigger.player.addhyyzBuff('hyyzBuff_zhuoshao');
							game.hyyzSkillAudio('hyyzxinghuo', 1, 2)
						} else {
							game.hyyzSkillAudio('hyyzxinghuo', 3)
							player.addToExpansion(event.cards, 'gain2').gaintag.add('hyyzxinghuo');
							player.draw();
						}
						if (trigger.player == player) {
							game.hyyzSkillAudio('hyyzxinghuo', 4)
							await player.recover();
						}
					},
				}
			}
		},
		hyyztianhuo: {
			audio: 1,
			skillAnimation: true,
			animationColor: "fire",
			juexingji: true,
			unique: true,
			trigger: {
				player: "phaseZhunbeiBegin",
			},
			forced: true,
			filter(event, player) {
				return player.getExpansions('hyyzxinghuo').length >= 3;
			},
			derivation: ["hyyzhonglian"],
			async content(event, trigger, player) {
				player.awakenSkill('hyyztianhuo');
				await player.loseMaxHp();
				player.addSkills('hyyzhonglian');
			},
		},
		hyyzhonglian: {
			audio: 3,
			init(player) {
				player.storage.hyyzhonglian = [];
			},
			logAudio(event, player) {
				return [
					'ext:忽悠宇宙/asset/character/audio/hyyzhonglian1.mp3',
				]
			},
			enable: "phaseUse",
			filter(card, player) {
				return player.getExpansions('hyyzxinghuo').length > 0 && game.countPlayer(function (current) {
					return current.countCards('h') > 0 && !player.storage.hyyzhonglian.includes(current)
				}) > 0
			},
			filterTarget(card, player, target) {
				return target.countCards('h') && !player.storage.hyyzhonglian.includes(target);
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				player.storage.hyyzhonglian.add(target);
				player.when({ global: 'phaseAfter' }).then(() => {
					player.storage.hyyzhonglian = []
				})
				const { cards } = await player
					.choosePlayerCard(target, true, 'h')
					.forResult();
				if (cards) {
					await target.showCards(cards);
					const loses = player.getExpansions('hyyzxinghuo').filter(card => get.suit(card) == get.suit(cards[0]));
					if (loses.length) {
						const { bool } = await player
							.chooseBool()
							.set('prompt', `是否弃置${get.translation(loses)}对${get.translation(target)}造成1点火焰伤害？`)
							.set('ai', () => true)
							.forResult();
						if (bool) {
							game.hyyzSkillAudio('hyyzhonglian', 2)
							player.loseToDiscardpile(loses);
							target.damage('fire', player)
						} else {
							game.hyyzSkillAudio('hyyzhonglian', 3)
						}
					} else {
						game.hyyzSkillAudio('hyyzhonglian', 3)
					}
				}
			},
			ai: {
				combo: 'hyyzxinghuo',
				order: 8,
				result: {
					target(player, target) {
						if (target.hasSkillTag('nofire')) return 0;
						return get.damageEffect(target, player, target, 'fire') - (target.countCards('e') > 1 ? 1.5 : 0);
					},
				},
				tag: {
					damage: 1,
					fireDamage: 1,
					natureDamage: 1,
					norepeat: 1,
				},
			},
		},
		hyyzzhuiji_info: "追击|当你受到伤害/造成伤害后，你可以弃置受伤角色装备区内的一张牌。",
		hyyzxinghuo_info: "星火|锁定技，一名角色弃置装备牌后，你可以：<br>1.令该角色" + get.hyyzIntroduce('灼烧') + "。<br>2.将这些牌置于武将牌上并摸一张牌。<br>若该角色为你，你回复1点体力。",
		hyyztianhuo_info: "天火|觉醒技，准备阶段，若〖星火〗牌数不小于3，你减1点体力上限并获得〖红莲〗。",
		hyyzhonglian_info: "红莲|出牌阶段每名角色限一次，你可以展示一名角色的一张手牌，然后你可以弃置所有与之花色相同的〖星火〗牌并对其造成1点火焰伤害。",

		hyyz_xt_ren: ['刃', ["male", "hyyz_xt", 1, ["hyyzzhuchou", "hyyzhuiduo", "hyyztushang"], []], '紫灵谷的骊歌', '弃身锋刃的剑客，原名不详。效忠于「命运的奴隶」，拥有可怖的自愈能力。手持古剑作战，剑身遍布破碎裂痕，正如其身，亦如其心。'],
		hyyzzhuchou: {
			audio: 2,
			mod: {
				cardname(card, player) {
					if (lib.card[card.name].type == 'basic' && get.color(card) == 'red') return 'juedou';
				},
			},
			trigger: {
				player: "useCard",
			},
			forced: true,
			filter(event, player) {
				return event.card.name == "juedou" && get.color(event.card) == 'red';
			},
			async content(event, trigger, player) { },
		},
		hyyzhuiduo: {
			audio: 5,
			forced: true,
			group: ['hyyzhuiduo_init', 'hyyzhuiduo_dying', 'hyyzhuiduo_recover'],
			subSkill: {
				init: {
					trigger: {
						global: ["gameDrawAfter", "changeHp"]
					},
					direct: true,
					filter(event, player) {
						if (event.name == 'changeHp') {
							return player.hp <= 0 && player.hasSkill('hyyzhuiduo_mark');
						} else return true;
					},
					async content(event, trigger, player) {
						if (trigger.name == 'changeHp') {
							player.updateMark('hyyzhuiduo_mark');
						}
						else player.disableJudge();
					},
				},
				dying: {
					trigger: {
						player: ["dyingBefore"],

					},
					filter(event, player) {
						return player.hp <= 0;
					},
					forced: true,
					async content(event, trigger, player) {
						trigger.cancel();
						if (!player.hasSkill("hyyzhuiduo_mark")) player.addTempSkill("hyyzhuiduo_mark", { player: 'phaseEnd' });
						else player.say('还没结束！');
					},
				},
				recover: {
					trigger: {
						source: "damageEnd",
					},
					filter(event, player) {
						return player.hp < 1;
					},
					forced: true,
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyzhuiduo', 3, 4, 5)
						player.recover(trigger.num);
					},
				},
				mark: {
					marktext: "隳",
					intro: {
						markcount(storage, player) {
							return ('' + player.hp);
						},
						content(event, player) {
							return '你的体力值为' + get.translation(player.hp);
						},
					},
					forced: true,
					init(player) {
						game.log(player, "堕入<font color=#FF4500>魔阴身</font>");
						game.hyyzSkillAudio('hyyzhuiduo', 1)
						player.markSkill('hyyzhuiduo_mark');
					},
					onremove(player) {
						if (player.hp < 1) {
							game.log(player, '<font color=#FF4500>泯灭人性</font>');
							player.die();
						} else {
							game.hyyzSkillAudio('hyyzhuiduo', 2)
							game.log(player, '<font color=#FF4500>恢复人性</font>');
						}
					},
				},
			},
			ai: {
				nokeep: true,
			},
		},
		hyyztushang: {
			audio: 2,
			trigger: {
				source: "damageSource",
				player: "damageEnd",
			},
			usable: 3,
			forced: true,
			async content(event, trigger, player) {
				player.draw(trigger.num).gaintag = ['hyyztushang'];
			},
			mod: {
				ignoredHandcard(card, player) {
					if (card.hasGaintag('hyyztushang')) {
						return true;
					}
				},
				cardDiscardable(card, player, name) {
					if (name == 'phaseDiscard' && card.hasGaintag('hyyztushang')) {
						return false;
					}
				},
			},
			ai: {
				maixie: true,
				"maixie_hp": true,
				effect: {
					player(card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							return [1, 0.8]
						}
					},
					target(card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							if (!target.hasFriend()) return;
							return [1, 0.8];
						}
					},
				},
				threaten: 0.6,
			},
		},
		hyyzzhuchou_info: "诛雠|锁定技，你的红色基本牌视为【决斗】。",
		hyyzhuiduo_info: "隳堕|锁定技，你没有判定区，且不会进入濒死状态。<br>若你的体力值小于1：<br>1.你造成伤害后恢复等量体力；<br>2.回合结束后你死亡。",
		hyyztushang_info: "荼殇|锁定技，每回合限三次，你造成或受到1点伤害后，摸一张牌且不计入手牌上限。",

		hyyz_xt_sp_sushang: ['素裳', ["female", "hyyz_xt", 4, ["mengshanqing", "mengyouren", "mengwuji"], ['die:hyyz_xt_sushang']], '柚衣'],
		mengshanqing: {
			audio: 3,
			trigger: {
				player: "useCardToPlayer",
			},
			shaRelated: true,
			filter(event, player) {
				if (event.card.name != 'sha' || get.itemtype(event.cards) != 'cards') return false;
				return event.target.countGainableCards(player, 'he') > 0;
			},
			check(event, player) {
				return event.target.countGainableCards(player, 'he') > 0 && get.attitude(player, event.target) < 0;
			},
			frequent: "check",
			logTarget: "target",
			async content(event, trigger, player) {
				if (trigger.target.countGainableCards(player, 'e') > 0) {
					player.gainPlayerCard(trigger.target, 'e', true);
				} else if (trigger.target.countGainableCards(player, 'h') > 0) {
					player.gainPlayerCard(trigger.target, 'h', true);
				}
			},
			ai: {
				"unequip_ai": true,
				"directHit_ai": true,
				skillTagFilter(player, tag, arg) {
					if (tag == 'directHit_ai') return arg.card.name == 'sha' && arg.target.countCards('e', function (card) {
						return get.value(card) > 1;
					}) > 0;
					if (arg && arg.name == 'sha' && arg.target.getEquip(2)) return true;
					return false;
				},
			},
		},
		mengyouren: {
			audio: 3,
			trigger: {
				player: "useCardAfter",
			},
			check(event, player) {
				return get.attitude(player, event.targets[0]) < 0;
			},
			shaRelated: true,
			frequent: "check",
			forced: false,
			filter(event, player) {
				return event.card.name == 'sha' && get.itemtype(event.cards) == 'cards' && event.targets.length > 0;
			},
			async content(event, trigger, player) {
				let num = 1, str = '';
				if (trigger.targets.every(i => !i.countCards('e'))) {
					num++;
					str += '<li>目标的装备区内没有牌';
				}
				if (trigger.targets.every(i => !i.countCards('h'))) {
					num++;
					str += '<li>目标的手牌区内没有牌';
				}
				if (trigger.targets.some(i => i.hasHistory('sourceDamage', evt => evt.card == trigger.card))) {
					num++;
					str += '<li>' + get.translation(trigger.card) + '造成过伤害';
				}
				if (num > 1) game.log(event.name, '：', str);
				const cards = get.cards(num);
				const control = [],
					dialog = ['游刃', '弃置某种颜色的牌，视为对' + get.translation(trigger.targets) + '使用等量【杀】，然后获得剩余的牌'];

				if (cards.some(i => get.color(i) == 'red')) {
					dialog.push('红色牌');
					dialog.push(cards.filter(i => get.color(i) == 'red'));
					control.push('red');
				}
				if (cards.some(i => get.color(i) == 'black')) {
					dialog.push('红色牌');
					dialog.push(cards.filter(i => get.color(i) == 'black'));
					control.push('black');
				}
				control.push('cancel2');
				const gains = [];
				const result = await player.chooseControl(control)
					.set('dialog', dialog)
					.set('ai', function () {
						if (cards.filter(i => get.color(i) == 'red').length > cards.filter(i => get.color(i) == 'black').length) return 'red'
						return true
					})
					.forResult()
				if (result.control != 'cancel2') {
					const color = result.control;
					for (let card of cards) {
						if (get.color(card) == color && trigger.targets.some(i => player.canUse({ name: 'sha', isCard: true }, i, false, false))) {
							game.cardsDiscard(card)
							await player.useCard({ name: 'sha', isCard: true }, trigger.targets, false, false)
						} else {
							gains.add(card)
						}
						await game.delay()
					}
				} else {
					gains.addArray(cards);
				}
				player.gain(gains, 'gain2');
			},
		},
		mengwuji: {
			audio: 3,
			mod: {
				cardname(card, player, name) {
					if (get.type(card.name) == 'delay') return 'sha';
				},
			},
			ai: {
				skillTagFilter(player) {
					if (!player.countCards('h', function (card) {
						return get.type(card) == 'delay'
					})) return false;
				},
				respondSha: true,
			},
			trigger: {
				player: ["useCard1", "respond"],
			},
			firstDo: true,
			forced: true,
			filter(event, player) {
				return event.card.name == 'sha' && !event.skill &&
					event.cards.length == 1 && get.type(event.cards[0]) == 'delay';
			},
			async content(event, trigger, player) { },
		},
		mengshanqing_info: "山倾|当你使用非虚拟【杀】指定目标时，若其装备区内有牌，你获得其装备区的一张牌，否则获得其一张手牌。",
		mengyouren_info: "游刃|你使用的非虚拟【杀】结算结束后，展示牌堆顶一张牌；每满足一项便多展示一张牌：<br> 1.目标角色装备区内没有牌。<br> 2.目标角色手牌区内没有牌。<br> 3.此【杀】造成过伤害。<br> 若目标角色存活，你可以弃置展示牌中一种颜色的所有牌，视为对其使用相同数量的【杀】；然后获得剩余的牌。",
		mengwuji_info: "武继|锁定技，你的延时类锦囊牌视为【杀】。",

		hyyz_xt_sp_bronya: ['布洛妮娅', ["female", "hyyz_xt", 3, ["mengzhenjun", "mengzhenqu", "mengjunzhen"], ['zhu',]], '微雨', '尾巴已对技能〖整军〗〖阵曲〗〖军阵〗进行修改，若有其他方案可私信尾巴修改。'],
		mengzhenjun: {
			audio: 2,
			trigger: {
				player: "phaseUseEnd",
			},
			filter(event, player) {
				return player.countCards('he') > 0;
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseTarget('整军：是否令一名其他角色[净化]并其执行一个出牌阶段。', '若其未[净化]，其摸两张牌。', lib.filter.notMe)
					.set('ai', (target) => {
						if (get.attitude2(target) > 4) {
							var num = get.threaten(target) / Math.sqrt(target.hp + 1) / Math.sqrt(target.countCards('h') + 1)
							if (target.isTurnedOver()) num += 2;
							if (target.countCards('j') > 0) num++;
							if (target.isLinked()) num++;
							return num;
						}
						return false;
					})
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				if (target.canhyyzJinghua()) {
					target.hyyzJinghua();
				}
				else target.draw(2);
				var next = target.phaseUse();
				event.next.remove(next);
				trigger.getParent('phase').next.push(next);
			},
			ai: {
				expose: 0.5,
			},
		},
		mengzhenqu: {
			audio: 2,
			trigger: {
				global: "phaseUseBegin",
			},
			filter(event, player) {
				return player.countCards('he') && event.player != player;
			},
			round: 1,
			async cost(event, trigger, player) {
				event.result = await player
					.chooseCard('he', [1, Infinity], '阵曲：是否交出牌')
					.set('ai', card => get.attitude2(trigger.player) * get.value(card))
					.set('prompt2', '，令' + get.translation(trigger.player) + '使用交出的牌不能被响应')
					.forResult();
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.gain(event.cards, 'giveAuto').gaintag.add('mengzhenqu');
				await game.delay()
				player.drawTo(player.maxHp);
				trigger.player.addSkill('mengzhenqu_dir');
			},
			subSkill: {
				dir: {
					forced: true,
					trigger: {
						player: "useCard",
					},
					filter(event, player) {
						if (!event.card || !(get.type(event.card) == 'trick' || get.type(event.card) == 'basic' && !['shan', 'tao', 'jiu', 'du'].includes(event.card.name))) return false;
						return event.player.hasHistory('lose', function (evt) {
							if (evt.getParent() != event) return false;
							for (var i in evt.gaintag_map) {
								if (evt.gaintag_map[i].includes('mengzhenqu')) return true;
							}
							return false;
						});
					},
					async content(event, trigger, player) {
						trigger.directHit.addArray(game.filterPlayer());
					},
				},
			},
		},
		mengjunzhen: {
			audio: 1,
			zhuSkill: true,
			unique: true,
			trigger: {
				global: "damageBegin1",
			},
			filter(event, player) {
				if (!event.card || !event.cards.length) return false;
				if (player.countCards('h') <= player.hp) return false;
				if (!player.hasZhuSkill('mengjunzhen')) return false;
				if (!event.source || event.source == player || event.source.group != 'hyyz_xt') return false;
				return event.source.hasHistory('gain', (evt) => {
					game.log(evt.cards, '+++', event.cards)
					return event.cards.some(card => evt.cards.includes(card))
				})
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseCard('h', player.countCards('h') - player.hp, '军阵：是否重铸一些牌令此牌伤害+1？')
					.set('ai', () => get.attitude2(trigger.source))
					.forResult();
			},
			logTarget: 'source',
			async content(event, trigger, player) {
				player.recast(event.cards);
				trigger.num++;
			},
		},
		"mengzhenjun_info": "整军|出牌阶段结束时，你可以令一名其他角色" + get.hyyzIntroduce('净化') + "并执行一个出牌阶段。若其未" + get.hyyzIntroduce('净化') + "，其摸两张牌。",
		"mengzhenqu_info": "阵曲|每轮限一次，其他角色的出牌阶段开始时，你可以交给其任意张牌并将手牌摸至体力上限，该角色使用这些牌不能被响应。",
		"mengjunzhen_info": "军阵|主公技，其他星铁势力的角色使用当前回合获得的牌造成伤害时，你可以重铸超出体力值的手牌并令此牌伤害+1。",
	},
	2308: {
		hyyz_b3_hua: ['华', ["female", "hyyz_b3", 3, ["hyyzcunjin", "hyyzshenyin", "hyyzfusheng"], []], '紫灵谷的骊歌', '符华，本名华，第一文明纪元抗崩坏组织“逐火之蛾”的十三英桀之一，位次“XII”，刻印为“浮生”。负责火种计划的先行者，第二文明纪元成为守护神州的仙人赤鸢。天穹峰事件中失去无敌的力量，和天命主教奥托达成交易，成为天命A级女武神。伪装身份成为圣芙蕾雅学园学生，琪亚娜所在班级的班长。因为奥托的背叛而死，临死前发动羽渡尘第零额定功率，将意识转移到一根羽毛身上，压制空之律者的存在。抛弃的身体则被奥托治好，其中诞生了律者的意识。'],
		hyyzcunjin: {
			audio: 11,
			trigger: {
				player: ["useCardAfter", "loseAfter", "gainAfter"],
			},
			filter(event, player) {
				switch (event.name) {
					case 'useCard': return player.countCards('he') > 0;
					case 'lose': return event.type == 'discard';
					case 'gain': return player.countCards('hs') > 0;
				}
			},
			frequent: true,
			firstDo: true,
			async cost(event, trigger, player) {
				switch (trigger.name) {
					case 'useCard': {
						event.result = await player.chooseToDiscard('寸劲：弃置一张牌', 'he')
							.set('ai', (card) => 8 - get.value(card))
							.forResult()
						break;
					}
					case 'lose': {
						event.result = await player
							.chooseBool('寸劲：摸一张牌？')
							.set("frequentSkill", "hyyzcunjin")
							.forResult();
						break;
					}
					case 'gain': {
						event.result = await player
							.chooseToUse('寸劲：使用一张牌')
							.forResult()
						break;
					}
				}
			},
			async content(event, trigger, player) {
				if (trigger.name == 'lose') await player.draw();
			},
			ai: {
				threaten(player, target) {
					if (target.hp == 1) return 4;
					return 0.01;
				},
				effect: {
					target(card, player, target) {
						if (card.name == 'guohe') return [1, 2];
						if (get.type(card) == 'delay') return 0;
					},
				},
			},
		},
		hyyzshenyin: {
			audio: 1,
			trigger: {
				player: "useCard",
			},
			filter(event, player) {
				var list = [];
				player.getHistory('useCard', function (evt) {
					var type = get.type2(evt.card);
					list.add(type);
				})
				return list.length == player.maxHp;
			},
			forced: true,
			async content(event, trigger, player) {
				await player.gainMaxHp();
			},
			group: ['hyyzshenyin_recover'],
			subSkill: {
				recover: {
					audio: 'hyyzshenyin',
					trigger: {
						player: ["loseMaxHpAfter", "gainMaxHpAfter"],
					},
					forced: true,
					filter(event, player) {
						return event.num > 0;
					},
					async content(event, trigger, player) {
						await player.recover();
					},
				}
			}
		},
		hyyzfusheng: {
			audio: 5,
			trigger: {
				player: "phaseUseBefore"
			},
			forced: true,
			async content(event, trigger, player) {
				player.say('此即，浮生之铭！');
				trigger.cancel();
			},
			group: 'hyyzfusheng_dying',
			subSkill: {
				dying: {
					audio: 'hyyzfusheng',
					trigger: {
						global: 'dying'
					},
					filter(event, player) {
						if (!event.source || !event.source.isIn() || event.source == event.player) return false;
						if (event.player != player && event.source != player) return false;
						return true;
					},
					forced: true,
					async content(event, trigger, player) {
						player.loseMaxHp(player.maxHp - 1);
					},
				},
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							if (!target.hasFriend()) return;
							if (target.hp == 1) return [1, -2];
						}
					}
				}
			}
		},
		hyyzcunjin_info: "寸劲|当你使用牌后，你可以弃置一张牌；<br>当你弃置牌后，你可以摸一张牌；<br>当你获得牌后，你可以使用一张牌。",
		hyyzshenyin_info: "神音|锁定技，当你使用牌时，若本回合使用牌的类型数等于体力上限，你加1点体力上限；你改变体力上限后，回复1点体力。",
		hyyzfusheng_info: "浮生|锁定技，你跳过出牌阶段；你令其他角色进入濒死时，或其他角色令你进入濒死时，你将体力上限减至1。",

		hyyz_xt_bronya: ['布洛妮娅', ["female", "hyyz_xt", 3, ["hyyzceli", "hyyzchuxin"], ['zhu',]], '紫灵谷的骊歌', '贝洛伯格「大守护者」继承人，年轻干练的银鬃铁卫统领。<br>布洛妮娅从小接受着严格的教育，具备一名「继承人」所需的优雅举止与亲和力。<br>但在看到下层区的恶劣环境后，未来的最高决策者逐渐生出了疑惑…「我所受的训练，真的能带领人民过上他们想要的生活么？」'],
		hyyzceli: {
			audio: 4,
			init: (player) => player.storage.hyyzceli = [],
			trigger: {
				player: "phaseEnd",
			},
			filter(event, player) {
				return ["judge", "draw", "useCard", "discard"].some(name => !player.storage.hyyzceli.includes(name));
			},
			async cost(event, trigger, player) {
				const list = ["judge", "draw", "useCard", "discard"].filter(a => !player.storage.hyyzceli.includes(a));
				let str = `令一名其他角色[净化]并摸${list.length}张牌，然后依次执行`;
				const map = {
					'judge': '判定阶段',
					'draw': '摸牌阶段',
					'useCard': '出牌阶段',
					'discard': '弃牌阶段',
				}
				list.forEach(arr => {
					str += `“${map[arr]}”`
				});
				const { targets } = await player
					.chooseTarget(str, lib.filter.notMe)
					.set('ai', function (target) {
						let player = _status.event.player, att = get.attitude(player, target);
						let arr = _status.event.list;
						let val = 0;
						if (target.canhyyzJinghua()) val += 2;
						if (arr.includes('draw')) val += 2;
						if (arr.includes('useCard') && target.countCards('hs', { name: 'sha' })) val += 2;
						if (arr.includes('discard') && target.needsToDiscard()) val -= target.needsToDiscard();
						return val * att;
					})
					.set('list', list)
					.forResult();
				if (targets) event.result = {
					bool: true,
					cost_data: list.length,
					targets: targets
				}
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				target.hyyzJinghua();
				await target.draw(event.cost_data);
				let list = [];
				if (!player.storage.hyyzceli.includes('judge')) list.add('phaseJudge');
				if (!player.storage.hyyzceli.includes('draw')) list.add('phaseDraw');
				if (!player.storage.hyyzceli.includes('useCard')) list.add('phaseUse');
				if (!player.storage.hyyzceli.includes('discard')) list.add('phaseDiscard');
				target.insertPhase()
					.set('phaseList', list);
			},
			group: "hyyzceli_add",
			subSkill: {
				add: {
					trigger: { player: ["judge", "drawBegin", "useCard", "discard"] },
					silent: true,
					charlotte: true,
					async content(event, trigger, player) {
						player.storage.hyyzceli.add(trigger.name);
						let map = {
							judge: '判',
							draw: '摸',
							useCard: '用',
							discard: '弃'
						}

						player.addTip('hyyzceli', player.storage.hyyzceli.map(i => map[i]).join())
						player.when({
							global: 'phaseAfter'
						}).then(() => {
							player.storage.hyyzceli = [];
							player.removeTip('hyyzceli')
						})
					},
				},
			},
		},
		hyyzceli_info: `策励|回合结束后，若你本回合未进行
		<span class=firetext>判定</span>/
		<span class=thundertext>摸牌</span>/
		<span class=yellowtext>使用牌</span>/
		<span class=greentext>弃置牌</span>，你可令一名其他角色${get.hyyzIntroduce('净化')}并摸X张牌（X为你满足的条件数），然后该角色获得拥有
		<span class=firetext>判定</span>/
		<span class=thundertext>摸牌</span>/
		<span class=yellowtext>出牌</span>/
		<span class=greentext>弃牌</span>阶段的回合。`,
		hyyzchuxin: {
			audio: 5,
			logAudio: () => false,
			locked: true,
			trigger: {
				player: "damageBegin4",
			},
			forced: true,
			async content(event, trigger, player) {
				if (player.hasHistory('lose', (evt) => evt.cards2 && evt.cards2.length)) {
					game.log('#g【初心】', player, '尝试找回初心');
					game.hyyzSkillAudio('hyyzchuxin', 3, 4)
					var cards = [];
					player.hasHistory('lose', function (evt) {
						if (evt.cards2 && evt.cards2.length) {
							for (var i of evt.cards2) {
								var card = get.cardPile(function (card) {
									if (cards.includes(card)) return false;
									return get.type(card, 'trick') == get.type(i, 'trick');
								});
								if (card) cards.push(card);
							}
						}
					})
					if (cards.length) player.gain(cards, 'gain2');
				} else {
					game.log('#g【初心】', player, '初心未失，防止此伤害');
					game.hyyzSkillAudio('hyyzchuxin', 1, 5, 2)
					trigger.cancel()
				}
			},
			ai: {
				effect: {
					target(card, player, target) {
						if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
						if (get.tag(card, 'damage')) {

							let lose = 0;
							target.hasHistory('lose', function (evt) {
								if (evt.cards2?.length) lose += evt.cards2.length;
							})
							if (lose <= 0) return 'zerotarget';
							else {
								let att = 1;
								if (get.attitude(player, target) > 0) {
									att = player.needsToDiscard() ? 0.7 : 0.5;
								}
								if (target.hp >= 4) return [1, att * lose];
								if (target.hp == 3) return [1, att * lose * 0.75];
								if (target.hp == 2) return [1, att * 0.25];
							}
						} else {
							return [1, 2]
						}
					},
				},
			},
		},
		hyyzchuxin_info: "初心|锁定技，当你受到伤害时，若你本回合未失去过牌，防止此伤害；否则，获得与失去牌等量且类型相同的牌。",

		hyyz_xt_sushang: ['素裳', ["female", "hyyz_xt", 4, ["hyyzmengdong", "hyyzruoming", "hyyzhuangwu"], []], '紫灵谷的骊歌', '单纯热心的云骑军新人，执一柄重剑。<br>憧憬着云骑军历史上的传奇，渴望成为响当当的人物。<br>为此，素裳坚决恪守「急人所急，有求必应；日行一善，三省吾身」的信条，过着助人为乐的忙碌日子。'],
		hyyzmengdong: {
			audio: 3,
			trigger: {
				player: 'phaseDrawEnd'
			},
			forced: true,
			async content(event, trigger, player) { },
			mod: {
				cardname(card, player, target) {
					if (get.type(card.name, 'trick') == 'trick') return 'sha';
				},
				targetInRange(card) {
					if (!card.cards || card.name != 'sha' || !card.isCard) return;
					for (var i of card.cards) {
						if (get.type(i.name, 'trick') == 'trick') return true;
					}
				},
			},
		},
		"hyyzmengdong_info": "懵懂|锁定技，你的普通锦囊牌视为无距离限制的【杀】。",
		hyyzruoming: {
			audio: 3,
			trigger: {
				player: 'useCardBefore'
			},
			filter(event, player) {
				return event.card.name == 'sha' && event.getParent().name != 'hyyzhuangwu';
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseCard((card) => !trigger.cards.includes(card))
					.set('prompt', '若明：是否将一张手牌和牌堆顶的牌加入' + get.translation(trigger.card) + '的实体牌？')
					.set('ai', (card) => {
						let trigger = _status.event.getTrigger();
						return get.effect(trigger.targets[0], card, trigger.player, trigger.player);
					})
					.forResult();
			},
			async content(event, trigger, player) {
				const cards = event.cards;
				cards.addArray(get.cards())
				game.cardsGotoOrdering(cards);
				trigger.cards.addArray(cards)
				game.log(trigger.card, '的实体牌改为', trigger.cards);
			},
		},
		"hyyzruoming_info": "若明|你不因〖恍悟〗使用【杀】时，可将一张手牌和牌堆顶的牌加入实体牌。",
		hyyzhuangwu: {
			audio: 3,
			trigger: {
				player: "useCardAfter",
			},
			filter(event, player) {
				if (event.card.name != 'sha' || get.itemtype(event.cards) != 'cards') return false;
				if (!event.cards.length) return false;
				return event.card.name == 'sha' && event.getParent().name != 'hyyzhuangwu';
			},
			forced: true,
			async content(event, trigger, player) {
				let cards = trigger.cards;
				const targets = trigger.targets;
				await player.showCards(get.translation(player) + '发动了【恍悟】', cards);
				do {
					let card = cards.shift();
					for (let target of targets) {
						if (target.isIn() && player.canUse(card, target, false)) {
							await player.useCard(card, target, false);
						} else if (player.canUse(card, player, false)) {
							await player.useCard(card, player, false);
						} else {
							await player.gain(card, 'gain2');
						}
					}
				} while (cards.length > 0);
			}
		},
		"hyyzhuangwu_info": "恍悟|锁定技，你不因〖恍悟〗使用【杀】后，对此牌的实体牌执行首个可执行的一项：<br>1.对目标角色使用。<br>2.对自己使用。<br>3.获得。",

		hyyz_ɸ_xierde: ['希尔德', ["female", "hyyz_ɸ", 3, ["menghengyue", "mengguanyang"], []], '绯色愫', '尾巴已对技能〖横跃〗〖贯杨〗进行修改，若有其他方案可私信尾巴修改。'],
		menghengyue: {
			audio: 1,
			mod: {
				attackRangeBase(player) {
					if (player.getEquip(1)) return 2;
				},
				globalFrom(from, to, distance) {
					return distance - from.getStorage('menghengyue', 0)
				},
			},
			locked: true,
			trigger: {
				player: "useCardAfter",
			},
			filter(event, player) {
				if (!player.isPhaseUsing()) return false;
				if (!game.hasPlayer((current) => get.distance(player, current) == 1 && current.countGainableCards(player, 'he') > 0)) return false
				let suits = []
				const history = player.getHistory('useCard', (evt) => {
					suits.add(get.hyyzSuit(evt.card))
					return evt.card != event.card && get.suit(evt.card) == get.suit(event.card)
				})
				player.addTip('menghengyue', '横跃' + suits.unique().join(''))
				return !history.length
			},
			async cost(event, trigger, player) {
				if (game.countPlayer(current => {
					return get.distance(player, current) == 1 && current.countGainableCards(player, 'he') > 0
				}) > 1) {
					event.result = await player
						.chooseTarget(true, get.prompt('menghengyue'), '获得其一张牌，然后摸一张牌并交给其一张牌', function (card, player, target) {
							return get.distance(player, target) == 1 && target.countGainableCards(player, 'he') > 0
						})
						.set('ai', function (target) {
							return -get.attitude(_status.event.player, target)
						})
						.forResult()
				} else {
					event.result = {
						bool: true,
						targets: game.filterPlayer(current => {
							return get.distance(player, current) == 1 && current.countGainableCards(player, 'he') > 0
						})
					}
				}
			},
			async content(event, trigger, player) {
				await player.gainPlayerCard(event.targets[0], true, 'he');
				await player.draw();
				const { bool } = await player.chooseToGive(event.targets[0], true, 'he')
					.forResult();
				if (bool) {
					player.storage.menghengyue ??= 0
					player.storage.menghengyue++;
					player.when({
						global: 'phaseAfter'
					}).then(() => {
						delete player.storage.menghengyue
					})
				}
			},
		},
		mengguanyang: {
			audio: 1,
			enable: "chooseToUse",
			filter(event, player) {
				return player.countCards('he') >= player.storage.menghengyue && player.storage.menghengyue > 0
			},
			filterCard: true,
			selectCard() {
				return _status.event?.player.storage.menghengyue
			},
			usable: 1,
			position: "hes",
			viewAs: {
				name: "sha",
				storage: {
					mengguanyang: true,
				},
			},
			check(card) {
				var player = _status.event.player;
				return 7 - get.useful(card);
			},
			async precontent(event, trigger, player) {
				event.getParent().addCount = false;
			},
			mod: {
				targetInRange(card) {
					if (card.storage?.mengguanyang) return true;
				},
				cardUsable(card, player, num) {
					if (card.storage?.mengguanyang) return Infinity;
				},
			},
			group: ["mengguanyang_shan", "mengguanyang_used"],
			subSkill: {
				shan: {
					trigger: {
						player: "useCardToPlayered",
					},
					filter(event, player) {
						return event.target.hp >= player.hp && event.card && event.card.storage.mengguanyang && event.card.name == 'sha' && !event.getParent().directHit.includes(event.target);
					},
					locked: true,
					charlotte: true,
					async cost(event, trigger, player) { event.result = { bool: true } },
					async content(event, trigger, player) {
						var id = trigger.target.playerid;
						var map = trigger.getParent().customArgs;
						if (!map[id]) map[id] = {};
						if (typeof map[id].shanRequired == 'number') {
							map[id].shanRequired++;
						}
						else {
							map[id].shanRequired = 2;
						}
					},
					ai: {
						"directHit_ai": true,
						skillTagFilter(player, tag, arg) {
							if (arg.card.name != 'sha' || arg.target.countCards('h', 'shan') > 1) return false;
						},
					},
					sub: true,
				},
				used: {
					trigger: {
						player: "useCardAfter",
					},
					charlotte: true,
					filter(event, player) {
						if (!event.card.storage || !event.card.storage.mengguanyang) return false;
						return game.hasPlayer(function (current) {
							return current.hasHistory('damage', evt => evt.card == event.card) && get.distance(player, current) == 1;
						})
					},
					async cost(event, trigger, player) {
						event.result = {
							bool: true,
							targets: game.filterPlayer(current => {
								return current.hasHistory('damage', evt => evt.card == trigger.card) && get.distance(player, current) == 1;
							})
						}
					},
					async content(event, trigger, player) {
						for (let current of event.targets) {
							await current.addhyyzBuff('hyyzBuff_jiansu')
						}
					},
				},
			},
			ai: {
				yingbian(card, player, targets, viewer) {
					if (get.attitude(viewer, player) <= 0) return 0;
					var base = 0, hit = false;
					if (get.cardtag(card, 'yingbian_hit')) {
						hit = true;
						if (targets.filter(function (target) {
							return target.hasShan() && get.attitude(viewer, target) < 0 && get.damageEffect(target, player, viewer, get.nature(card)) > 0;
						})) base += 5;
					}
					if (get.cardtag(card, 'yingbian_all')) {
						if (game.hasPlayer(function (current) {
							return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
						})) base += 5;
					}
					if (get.cardtag(card, 'yingbian_damage')) {
						if (targets.filter(function (target) {
							return get.attitude(player, target) < 0 && (hit || !target.mayHaveShan() || player.hasSkillTag('directHit_ai', true, {
								target: target,
								card: card,
							}, true)) && !target.hasSkillTag('filterDamage', null, {
								player: player,
								card: card,
								jiu: true,
							})
						})) base += 5;
					}
					return base;
				},
				canLink(player, target, card) {
					if (!target.isLinked() && !player.hasSkill('wutiesuolian_skill')) return false;
					if (target.mayHaveShan() && !player.hasSkillTag('directHit_ai', true, {
						target: target,
						card: card,
					}, true)) return false;
					if (player.hasSkill('jueqing') || player.hasSkill('gangzhi') || target.hasSkill('gangzhi')) return false;
					return true;
				},
				basic: {
					useful: [5, 3, 1],
					value: [5, 3, 1],
				},
				order(item, player) {
					if (player.hasSkillTag('presha', true, null, true)) return 10;
					if (lib.linked.includes(get.nature(item))) {
						if (game.hasPlayer(function (current) {
							return current != player && current.isLinked() && player.canUse(item, current, null, true) && get.effect(current, item, player, player) > 0 && lib.card.sha.ai.canLink(player, current, item);
						}) && game.countPlayer(function (current) {
							return current.isLinked() && get.damageEffect(current, player, player, get.nature(item)) > 0;
						}) > 1) return 3.1;
						return 3;
					}
					return 3.05;
				},
				result: {
					target(player, target, card, isLink) {
						var eff = function () {
							if (!isLink && player.hasSkill('jiu')) {
								if (!target.hasSkillTag('filterDamage', null, {
									player: player,
									card: card,
									jiu: true,
								})) {
									if (get.attitude(player, target) > 0) {
										return -7;
									}
									else {
										return -4;
									}
								}
								return -0.5;
							}
							return -1.5;
						}();
						if (!isLink && target.mayHaveShan() && !player.hasSkillTag('directHit_ai', true, {
							target: target,
							card: card,
						}, true)) return eff / 1.2;
						return eff;
					},
				},
				respond: 1,
				respondShan: 1,
				damage(card) {
					if (card.nature == 'poison') return;
					return 1;
				},
				natureDamage(card) {
					if (card.nature) return 1;
				},
				fireDamage(card, nature) {
					if (card.nature == 'fire') return 1;
				},
				thunderDamage(card, nature) {
					if (card.nature == 'thunder') return 1;
				},
				poisonDamage(card, nature) {
					if (card.nature == 'poison') return 1;
				},
			},
		},
		"menghengyue_info": "横跃|锁定技，若你的武器栏内有牌，你的攻击范围视为2。每回合每种花色限一次，你使用牌后，获得距离为1的角色一张牌，然后摸一张牌并交给其一张牌；若如此做，本回合你的进攻距离-1。",
		"mengguanyang_info": "贯杨|出牌阶段限一次，你可以将X张牌当一张无距离和次数限制的【杀】对一名其他角色使用（X为本回合发动“横跃”的次数）。若该角色的体力值不小于你，其须使用两张【闪】响应此【杀】；此【杀】造成伤害后，若你与该角色的距离为1，你令其" + get.hyyzIntroduce('减速') + "。",

		hyyz_xt_kelala: ['克拉拉', ["female", "hyyz_xt", 4, ["mengdaijia", "mengweijia", "mengruyue"], []], '日玖阳气冲三关', '尾巴已对技能〖代价〗〖如约〗进行修改，若有其他方案可私信尾巴修改。'],
		mengdaijia: {
			audio: 3,
			logAudio: () => [
				"ext:忽悠宇宙/asset/character/audio/mengdaijia1.mp3",
				"ext:忽悠宇宙/asset/character/audio/mengdaijia2.mp3",
			],
			trigger: {
				global: "phaseZhunbeiBegin",
			},
			check(event, player) {
				var num = game.countPlayer(function (current) {
					return current != player && get.attitude(player, current) > 3 && player.hp > current.hp;
				})
				if (num <= 0) return false;
				if (get.attitude(player, event.player) < -2) {
					var cards = player.getCards('h');
					if (cards.length > player.hp) return true;
					for (var i = 0; i < cards.length; i++) {
						var useful = get.useful(cards[i]);
						if (useful < 5 || get.number(cards[i]) > 9 && useful < 7) return true;
					}
				}
				return false;
			},
			logTarget: "player",
			filter(event, player) {
				return player.canCompare(event.player) && !player.getRoundHistory('damage').length;
			},
			async content(event, trigger, player) {
				const { bool } = await player
					.chooseToCompare(trigger.player, function (card) {
						var player = get.owner(card);
						var target = _status.event.getParent().target;
						if (target != player && get.attitude(player, target) < 0 &&
							game.hasPlayer((current) => current != target &&
								get.attitude(target, current) > 4 && current.hp < target.hp))
							return -get.number(card);
					})
					.forResult();
				if (bool) {
					game.hyyzSkillAudio('mengdaijia', 3)
					trigger.player.addTempSkill('mengdaijia_me');
					trigger.player.storage.xtshengjia_me = player;
				}
				else {
					player.damage(trigger.player);
				}
			},
			subSkill: {
				me: {
					onremove: true,
					mod: {
						playerEnabled(card, player, target) {
							if (player.storage.xtshengjia_me != target && target != player && (!get.info(card) || !get.info(card).singleCard || !ui.selected.targets.length)) return false;
						},
					},
					mark: true,
					intro: {
						content(player, storage) {
							return '只能对自己和' + get.translation(storage) + '使用牌';
						},
					},
					sub: true,
				},
			},
		},
		mengweijia: {
			audio: 4,
			trigger: {
				player: "damageEnd",
			},
			filter(event, player) {
				return event.source && event.source != player;
			},
			forced: true,
			logTarget: 'source',
			async content(event, trigger, player) {
				await trigger.source.damage(player);
				trigger.source.addSkills('mengjinggao');
			},
			ai: {
				"maixie_defend": true,
				threaten: 0.85,
				effect: {
					target(card, player, target) {
						if (player.hasSkillTag('jueqing', false, target)) return;
						return [1, 0, 0, player.hp == 1 ? -1.2 : -0.8];
					},
				},
			},
		},
		mengruyue: {
			audio: 4,
			logAudio: () => false,
			trigger: {
				source: "damageBegin1",
			},
			filter(event, player) {
				if (!event.player.hasSkill('mengjinggao')) return false;
				if (!event.card) return true;
				if (_status.currentPhase != player) return true;
			},
			forced: true,
			async content(event, trigger, player) {
				const { control } = await player
					.chooseControl('此伤害+1', '回复1点体力')
					.set('ai', () => ['此伤害+1', '回复1点体力'].randomGet())
					.forResult();
				if (control == '此伤害+1') {
					game.hyyzSkillAudio('mengruyue', 1, 2)
					trigger.num++;
				} else {
					await trigger.player.removeSkills(['mengjinggao']);
					game.hyyzSkillAudio('mengruyue', 3, 4)
					player.recover();
				}
			},
		}, mengjinggao: {
			mark: true,
			marktext: "警",
			intro: {
				name: "警告",
				content: "史瓦罗在看着你",
			},
			charlotte: true,
			locked: true,
		},
		"mengdaijia_info": "代价|一名角色的准备阶段，若你本轮未受过伤，你可以与其拼点。若你赢，本回合该角色只能对你与其使用牌；否则，对你造成1点伤害。",
		mengjinggao_info: "警告|",
		"mengweijia_info": "为家|锁定技，你受到伤害后，对伤害来源造成1点伤害，然后令其获得“警告”。",
		"mengruyue_info": "如约|锁定技，你对有“警告”的其他角色造成" + get.hyyzIntroduce('追加攻击') + "伤害时，移去“警告”并选择一项：①此伤害+1；②回复1点体力。",

		hyyz_b3_sp_xier: ['希儿', ["female", "hyyz_b3", 3, ["mengshuangsheng", "mengbian"], []], '微雨', '尾巴已对技能〖双生〗〖彼岸〗进行修改，若有其他方案可私信尾巴修改。'],
		mengshuangsheng: {
			audio: 5,
			logAudio: () => false,
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content(storage, player, skill) {
					var str = '';
					if (player.storage.mengshuangsheng == true) str += '当你使用伤害牌时，可以令目标本回合非锁定技失效并改为对目标〖强袭〗';
					else str += '当你受到伤害时，你可以弃置两张颜色不同的牌并改为加1点体力上限。';
					return str;
				},
			},
			group: ["mengshuangsheng_1", "mengshuangsheng_2"],
			subSkill: {
				"1": {
					audio: 'mengshuangsheng',
					logAudio: () => [
						"ext:忽悠宇宙/asset/character/audio/mengshuangsheng1.mp3",
						"ext:忽悠宇宙/asset/character/audio/mengshuangsheng2.mp3",
					],
					trigger: {
						player: "damageBegin4",
					},
					filter(event, player) {
						return player.storage.mengshuangsheng != true && player.countCards('he', { color: 'red' }) && player.countCards('he', { color: 'black' });
					},
					async cost(event, trigger, player) {
						event.result = await player
							.chooseToDiscard('是否发动【双生·阳】？', '弃置两张颜色不同的牌并改为加1点体力上限', 'he', 2, function (card) {
								if (ui.selected.cards.length > 0) {
									if (get.color(card) == get.color(ui.selected.cards[0])) return false;
								}
								return true;
							})
							.set('complexCard', true)
							.set('ai', (card) => 8 - get.value(card))
							.forResult();
					},
					async content(event, trigger, player) {
						game.hyyzSkillAudio('mengshuangsheng', 1, 2)
						player.changeZhuanhuanji('mengshuangsheng');
						trigger.cancel();
						player.gainMaxHp();
					},
					ai: {
						"maixie_defend": true,
						effect: {
							target(card, player, target) {
								if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
								if (!target.hasFriend()) return;
								if (target.countCards('he', { color: 'red' }) && target.countCards('he', { color: 'black' })) {
									return [1, 2];
								}
							},
						},
					},
				},
				"2": {
					audio: 'mengshuangsheng',
					logAudio: () => [
						"ext:忽悠宇宙/asset/character/audio/mengshuangsheng3.mp3",
						"ext:忽悠宇宙/asset/character/audio/mengshuangsheng4.mp3",
						"ext:忽悠宇宙/asset/character/audio/mengshuangsheng5.mp3",
					],
					trigger: {
						player: "useCard",
					},
					filter(event, player) {
						if (!event.cards.length) return false;
						if (!get.tag(event.card, 'damage') || !event.targets.length) return false;
						return player.storage.mengshuangsheng == true && player.hp > 0 && event.target != player;
					},
					prompt: '是否发动【双生·阴】？',
					prompt2: "令目标本回合非锁定技失效，改为对其〖强袭〗。",
					check(event, player) {
						return player.hp > 1;
					},
					async content(event, trigger, player) {
						player.changeZhuanhuanji('mengshuangsheng');
						trigger.cancel();
						for (let target of trigger.targets) {
							target.addTempSkill('fengyin');
							await player.loseHp();
							await target.damage(player, 1);
						}
					},
				}
			},
		},
		mengbian: {
			audio: 2,
			unique: true,
			trigger: {
				player: 'dying'
			},
			juexingji: true,
			skillAnimation: true,
			animationColor: "gray",
			forced: true,
			async content(event, trigger, player) {
				player.awakenSkill('mengbian');
				await player.addSkills(['mengjuangu']);
				while (player.maxHp > 0 && player.isDamaged()) {
					await player.loseMaxHp();
					await player.chooseUseTarget({ name: 'sha', nature: 'hyyz_quantum' }, false, 'nodistance');
				}
			},
			derivation: 'mengjuangu',
			ai: {
				order: 100,
				result: {
					target(player, target) {
						var eff = get.damageEffect(target, player, player);
						if (player.maxHp == 1 || player.maxHp == player.hp) return;
						if (ui.selected.targets.length <= player.getDamagedHp()) return -eff;
					},
				},
			},
		},
		mengjuangu: {
			audio: 4,
			trigger: {
				player: "loseAfter",
			},
			forced: true,
			filter(event, player) {
				var evt = event.getl(player);
				if (!evt.cards2 || !evt.cards2.length) return false;
				return !["useCard", "respond"].includes(event.getParent().name);
			},
			async content(event, trigger, player) {
				player.changeHujia(1);
			},
			group: "mengjuangu_1",
			subSkill: {
				"1": {
					audio: 'mengjuangu',
					trigger: {
						player: "changeHujiaBefore",
					},
					filter(event, player) {
						return player.isDamaged() && event.num > 0;
					},
					forced: true,
					async content(event, trigger, player) {
						let num = player.getDamagedHp();
						if (trigger.num > num) {
							await player.recover(trigger.num - num);
							trigger.num -= num;
						} else {
							trigger.cancel();
							await player.recover(trigger.num);
						}
						await player.draw();
					},
				},
			},
		},
		"mengshuangsheng_info": "双生|转换技，<br>阳：你受到伤害时，可弃置两张不同颜色的牌并改为加1点体力上限。<br>阴：当你使用非虚拟伤害牌时，可以取消此牌，令目标本回合非锁定技失效并对目标发动〖强袭〗。",
		"mengbian_info": "彼岸|觉醒技，当你进入濒死状态时，获得〖眷顾〗，然后重复减少1点体力上限并视为使用无距离限制的量子【杀】，直到你未受伤。",
		"mengjuangu_info": "眷顾|锁定技，你不因使用或打出失去牌后，获得1枚护甲；当你获得护甲时，优先改为回复体力。",

		hyyz_b3_kiana: ['琪亚娜', ["female", "hyyz_b3", 4, ['mengyuehua', 'mengliushang'], ['zhu',]], '拾壹'],
		mengyuehua: {
			audio: 3,
			init(player, skill) {
				player.storage[skill] = {
					0: [true, async function (trigger, player) {
						const { targets } = await player.chooseTarget('对一名角色造成1点火焰伤害', true)
							.set('ai', function (target) {
								return get.damageEffect(target, player, player, 'fire');
							})
							.forResult()
						if (targets) {
							await targets[0].damage('fire')
						}
					}],
					1: [true, async function (trigger, player) {
						await player.recover();
					}],
					2: [true, async function (trigger, player) {
						await player.draw();
					}],
					3: [true, async function (trigger, player) {
						const { targets } = await player.chooseTarget('对一名角色造成1点冰冻伤害', true)
							.set('ai', function (target) {
								return get.damageEffect(target, player, player, 'ice');
							})
							.forResult()
						if (targets) {
							await targets[0].damage('ice')
						}
					}],
					4: [true, async function (trigger, player) {
						const { targets } = await player
							.chooseTarget('弃置一名角色区域内的一张牌', function (card, player, target) {
								return target.countDiscardableCards(player, 'hej');
							}, true)
							.forResult()
						if (targets) {
							await player.discardPlayerCard(targets[0], 'he', true)
						}
					}],
					5: [true, async function (trigger, player) {
						const { targets } = await player.chooseTarget('获得一名角色区域内的一张牌', function (card, player, target) {
							return target.countGainableCards(player, 'hej') && target != player;
						}, true)
							.forResult()
						if (targets) {
							await player.gainPlayerCard(targets[0], 'he', true)
						}
					}],
					6: [true, async function (trigger, player) {
						const { targets } = await player.chooseTarget('对一名角色造成1点雷电伤害')
							.set('ai', function (target) {
								return get.damageEffect(target, player, player, 'thunder');
							}, true)
							.forResult()
						if (targets) {
							await targets[0].damage('thunder')
						}
					}],
				}
				lib.skill.mengyuehua.$syncTip(player);
			},
			$syncTip(player) {
				let list = [];
				for (let i in player.storage.mengyuehua) {
					if (player.storage.mengyuehua[i][0]) list.add(`<span class="greentext">${Number(i) + 1}</span>`)
					else list.add(`<span class="firetext">${Number(i) + 1}</span>`)
				}
				if (list.length) player.addTip('mengyuehua', '月华 ' + list.join(''))
				else player.removeTip('mengyuehua')
			},
			trigger: {
				player: 'mengyuehuaContent'
			},
			async cost(event, trigger, player) {
				const index = trigger.getParent().skill[11];
				player.storage.mengyuehua[index][0] = false;//限一次
				lib.skill.mengyuehua.$syncTip(player);

				player.when({
					global: 'phaseAfter'
				}).then(() => {
					for (let i in player.storage.mengyuehua) {
						player.storage.mengyuehua[i][0] = true
					}
					lib.skill.mengyuehua.$syncTip(player);
				})

				let list = [
					'对一名角色造成1点火焰伤害',
					'回复1点体力',
					'摸一张牌',
					'对一名角色造成1点冰冻伤害',
					'弃置一名角色区域内的一张牌',
					'获得一名其他角色的一张牌',
					'对一名角色造成1点雷电伤害',
				];
				for (let i = 0; i < list.length; i++) {
					if (player.storage.mengyuehua[i] == undefined) {
						list[i] = [i, '<s>' + list[i] + '</s>'];
					}
					else list[i] = [i, list[i]];
				}
				const next = player.chooseButton([
					'月华：执行一项',
					[list.slice(0, 1), 'tdnodes'],
					[list.slice(1, 3), 'tdnodes'],
					[list.slice(3, 4), 'tdnodes'],
					[list.slice(4, 5), 'tdnodes'],
					[list.slice(5, 6), 'tdnodes'],
					[list.slice(6, 7), 'tdnodes'],
				]);
				next.set('forced', false);
				next.set('selectButton', [1, 1]);
				next.set('filterButton', function (button) {
					let player = get.player()
					let storage = player.getStorage('mengyuehua')
					if (button.link == 0) return storage[0]?.[0];
					if (button.link == 1) return storage[1]?.[0] && player.isDamaged();
					if (button.link == 2) return storage[2]?.[0];
					if (button.link == 3) return storage[3]?.[0];
					if (button.link == 4) return storage[4]?.[0] && game.hasPlayer((current) => current != player && current.countDiscardableCards(player, 'hej') > 0);
					if (button.link == 5) return storage[5]?.[0] && game.hasPlayer((current) => current != player && current.countGainableCards(player, 'hej') > 0);
					if (button.link == 6) return storage[6]?.[0];
				});
				next.set('ai', function (button) {
					let player = get.player()
					switch (button.link) {
						case 0: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'fire') > num) num = get.damageEffect(current, player, player);
							})) return num;
						}
						case 1: {
							if (player.isDamaged()) {
								if (player.hp == 1) return 2;
								if (player.hp == 2) return 1.5;
								return 1.2
							};
						}
						case 2: return 0.8;
						case 3: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'ice') > num) num = get.damageEffect(current, player, player);
							})) return num;
						}
						case 4: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								var att = get.attitude(player, current);
								if (att < 0) att = -Math.sqrt(-att);
								else att = Math.sqrt(att);
								if (att * lib.card.guohe.ai.result.target(player, current) > num) num = att * lib.card.guohe.ai.result.target(player, current);
							})) return num;
						}
						case 5: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								var att = get.attitude(player, current);
								if (att < 0) att = -Math.sqrt(-att);
								else att = Math.sqrt(att);
								if (att * lib.card.shunshou.ai.result.target(player, current) > num) num = att * lib.card.shunshou.ai.result.target(player, current);
							})) return num;
						}
						case 6: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'thunder') > num) num = get.damageEffect(current, player, player) > num;
							})) return num;
						}
					}
				});
				const { links } = await next.forResult()
				if (links) {
					event.result = {
						bool: true,
						cost_data: links
					}
				}
			},
			async content(event, trigger, player) {
				const index = event.cost_data[0];
				game.log('#g【月华】', player, '执行了', '#y选项' + get.cnNumber(index + 1, true));
				player.storage.mengyuehua[index][0] = false;//限一次
				lib.skill.mengyuehua.$syncTip(player);
				await player.getStorage('mengyuehua')[index][1](trigger, player);
			},
			group: ['mengyuehua_0', 'mengyuehua_1', 'mengyuehua_2', 'mengyuehua_3', 'mengyuehua_4', 'mengyuehua_5', 'mengyuehua_6'],
			subSkill: {
				0: {
					trigger: {
						source: 'damageSource',
					},
					filter(event, player) {
						if (!player.getStorage('mengyuehua')[0]?.[0]) return false
						return event.hasNature("fire") && event.num == 1
					},
					silent: true,
					async content(event, trigger, player) {
						event.trigger('mengyuehuaContent')
					},
				},
				1: {
					trigger: {
						player: 'recoverAfter'
					},
					filter(event, player) {
						if (!player.getStorage('mengyuehua')[1]?.[0]) return false
						return event.num == 1
					},
					silent: true,
					async content(event, trigger, player) {
						event.trigger('mengyuehuaContent')
					},
				},
				2: {
					trigger: {
						player: 'drawAfter'
					},
					filter(event, player) {
						if (!player.getStorage('mengyuehua')[2]?.[0]) return false
						return event.num == 1
					},
					silent: true,
					async content(event, trigger, player) {
						event.trigger('mengyuehuaContent')
					},
				},
				3: {
					trigger: {
						source: 'damageSource',
					},
					filter(event, player) {
						if (!player.getStorage('mengyuehua')[3]?.[0]) return false
						return event.hasNature("ice") && event.num == 1
					},
					silent: true,
					async content(event, trigger, player) {
						event.trigger('mengyuehuaContent')
					},
				},
				4: {
					trigger: {
						global: 'discardAfter'
					},
					filter(event, player) {
						if (!player.getStorage('mengyuehua')[4]?.[0]) return false
						return event.cards.length == 1 && (event.discarder || event.getParent().player) == player
					},
					silent: true,
					async content(event, trigger, player) {
						event.trigger('mengyuehuaContent')
					},
				},
				5: {
					trigger: {
						player: 'gainAfter'
					},
					filter(event, player) {
						if (!player.getStorage('mengyuehua')[5]?.[0]) return false
						return event.cards.length == 1 && game.hasPlayer2(current => current != player && event.getl(current)?.cards2?.length > 0)
					},
					silent: true,
					async content(event, trigger, player) {
						event.trigger('mengyuehuaContent')
					},
				},
				6: {
					trigger: {
						source: 'damageSource',
					},
					filter(event, player) {
						if (!player.getStorage('mengyuehua')[6]?.[0]) return false
						return event.hasNature("thunder") && event.num == 1
					},
					silent: true,
					async content(event, trigger, player) {
						event.trigger('mengyuehuaContent')
					},
				},
			}
		},
		mengliushang: {
			audio: 2,
			trigger: {
				player: ["useCard", "respond"],
			},
			filter(event, player) {
				return event.respondTo && event.respondTo[0] != player;
			},
			async cost(event, trigger, player) {
				let list = [
					'对一名角色造成1点火焰伤害',
					'回复1点体力',
					'摸一张牌',
					'对一名角色造成1点冰冻伤害',
					'弃置一名角色区域内的一张牌',
					'获得一名其他角色的一张牌',
					'对一名角色造成1点雷电伤害',
				];
				for (let i = 0; i < list.length; i++) {
					if (player.storage.mengyuehua[i] == undefined) {
						list[i] = [i, '<s>' + list[i] + '</s>'];
					}
					else list[i] = [i, list[i]];
				}
				const next = player.chooseButton([
					'流裳：执行一项并永久移除',
					[list.slice(0, 1), 'tdnodes'],
					[list.slice(1, 3), 'tdnodes'],
					[list.slice(3, 4), 'tdnodes'],
					[list.slice(4, 5), 'tdnodes'],
					[list.slice(5, 6), 'tdnodes'],
					[list.slice(6, 7), 'tdnodes'],
				]);
				next.set('forced', false);
				next.set('selectButton', [1, 1]);
				next.set('filterButton', function (button) {
					let player = get.player()
					let storage = player.getStorage('mengyuehua')
					if (button.link == 0) return storage[0]?.[0];
					if (button.link == 1) return storage[1]?.[0] && player.isDamaged();
					if (button.link == 2) return storage[2]?.[0];
					if (button.link == 3) return storage[3]?.[0];
					if (button.link == 4) return storage[4]?.[0] && game.hasPlayer((current) => current != player && current.countDiscardableCards(player, 'hej') > 0);
					if (button.link == 5) return storage[5]?.[0] && game.hasPlayer((current) => current != player && current.countGainableCards(player, 'hej') > 0);
					if (button.link == 6) return storage[6]?.[0];
				});
				next.set('ai', function (button) {
					let player = get.player()
					switch (button.link) {
						case 0: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'fire') > num) num = get.damageEffect(current, player, player);
							})) return num;
						}
						case 1: {
							if (player.isDamaged()) {
								if (player.hp == 1) return 2;
								if (player.hp == 2) return 1.5;
								return 1.2
							};
						}
						case 2: return 0.8;
						case 3: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'ice') > num) num = get.damageEffect(current, player, player);
							})) return num;
						}
						case 4: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								var att = get.attitude(player, current);
								if (att < 0) att = -Math.sqrt(-att);
								else att = Math.sqrt(att);
								if (att * lib.card.guohe.ai.result.target(player, current) > num) num = att * lib.card.guohe.ai.result.target(player, current);
							})) return num;
						}
						case 5: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								var att = get.attitude(player, current);
								if (att < 0) att = -Math.sqrt(-att);
								else att = Math.sqrt(att);
								if (att * lib.card.shunshou.ai.result.target(player, current) > num) num = att * lib.card.shunshou.ai.result.target(player, current);
							})) return num;
						}
						case 6: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'thunder') > num) num = get.damageEffect(current, player, player) > num;
							})) return num;
						}
					}
				});
				const { links } = await next.forResult()
				if (links) {
					event.result = {
						bool: true,
						cost_data: links
					}
				}
			},
			async content(event, trigger, player) {
				const index = event.cost_data[0];
				game.log('#g【月华】', player, '执行并移除了', '#g【月华】', '的', '#y选项' + get.cnNumber(index + 1, true));
				const func = player.getStorage('mengyuehua')[index][1]
				delete player.storage.mengyuehua[index]
				lib.skill.mengyuehua.$syncTip(player);
				await func(trigger, player);
			},
		},
		"mengyuehua_info": "月华|当你执行以下一项后，你可以选择一项执行（每回合每项只能触发和执行一次）：<br>1.对一名角色造成1点火焰伤害；<br>2.回复1点体力；<br>3.摸一张牌；<br>4.对一名角色造成1点冰冻伤害；<br>5.弃置一名角色区域内的一张牌；<br>6.获得一名其他角色的一张牌；<br>7.对一名角色造成1点雷电伤害。",
		"mengliushang_info": "流裳|当你响应其他角色的牌后，你可以执行并移除〖月华〗中的一项。",

		hyyz_b3_sb_jiziwuliangta: ['姬子', ["female", "hyyz_b3", "1/9", ["mengezhan", "mengzhuoshi", "mengjiyi", "mengzhicheng"], ['die:hyyz_b3_jiziwuliangta']], '沧海依酥', ''],
		mengezhan: {
			audio: 'hyyzpoxiao',
			ai: {
				halfneg: true,
				threaten: 1.2,
				effect: {
					target(card, player, target) {
						if (target.countCards('he')) return [1, 0, 0, -1];
					}
				}
			},
			group: ['mengezhan_target', 'mengezhan_player'],
			subSkill: {
				target: {
					audio: 'mengezhan',
					trigger: {
						global: 'useCardAfter'
					},
					filter(event, player) {
						if (_status.currentPhase == player) return false;
						if (!event.player.isIn() || event.player == player) return false;
						if (!event.targets || event.targets.length != 1 || event.targets[0] != player) return false;
						return player.canUse({ name: 'sha' }, event.player, false) && player.countCards('h');
					},
					async cost(event, trigger, player) {
						event.result = await player
							.chooseCard('恶战：将一张手牌当【杀】对' + get.translation(trigger.player) + '使用')
							.set('ai', function (card) {
								if (get.effect(player, { name: 'sha' }, trigger.player, player) > 0) return 7 - get.value(card);
							})
							.forResult()
					},
					logTarget: 'player',
					async content(event, trigger, player) {
						var card = get.autoViewAs({ name: 'sha' }, event.cards)
						player.useCard(card, event.cards, trigger.player, false);
					},
				},
				player: {
					audio: 'mengezhan',
					trigger: {
						player: 'useCardAfter'
					},
					filter(event, player) {
						if (!player.isPhaseUsing()) return false;
						if (!event.targets || event.targets.length != 1) return false;
						if (!event.targets[0].isIn() || event.targets[0] == player) return false;
						if (!event.targets[0].canUse({ name: 'sha' }, player)) return false;
						return event.targets[0].countCards('h');
					},
					async cost(event, trigger, player) {
						event.result = await trigger.targets[0]
							.chooseCard('将一张手牌当【杀】对' + get.translation(player) + '使用')
							.set('ai', function (card) {
								if (get.effect(trigger.targets[0], { name: 'sha' }, player, trigger.targets[0]) > 0) return 8 - get.value(card);
							})
							.forResult();
					},
					async content(event, trigger, player) {
						var card = get.autoViewAs({ name: 'sha' }, event.cards)
						trigger.targets[0].useCard(card, event.cards, player, false)
					},
				}
			}
		},
		mengzhuoshi: {
			audio: 'hyyzxiepin',
			trigger: {
				player: 'damageBegin4'
			},
			filter(event, player) {
				return event.num > 0;
			},
			forced: true,
			async content(event, trigger, player) {
				var num = trigger.num;
				trigger.cancel();
				await player.loseMaxHp(num);
				await player.draw(num);
			},
			ai: {
				fireAttack: true,
				halfneg: true,
				threaten: 1.05,
				effect: {
					target(card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							return [1, 0, 0, -1];
						}
					}
				}
			},
		},
		mengjiyi: {
			audio: 'hyyzpoxiao',
			mod: {
				maxHandcard(player, num) {
					return player.maxHp;
				}
			},
			trigger: {
				player: ['useCard', 'shaMiss']
			},
			filter(event, player) {
				if (event.name == 'useCard') return event.card.name == 'sha';
				return event.target.isIn() && event.target.countCards('h') > 0;
			},
			forced: true,
			logTarget: 'targets',
			content() {
				if (trigger.name == 'useCard') {
					trigger.card.nature = 'fire';
				} else {
					trigger.target.chooseToDiscard(true);
				}
			},
			ai: {
				fireAttack: true,
			}
		},
		mengzhicheng: {
			audio: 'hyyzhuozhong',
			trigger: {
				player: 'dieBegin'
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget('志承：令一名其他角色增加一点体力上限并回复1点体力，然后令其获得技能〖疾疫〗和你区域内的所有牌', lib.filter.notMe)
					.set('ai', function (target) {
						var att = get.attitude(_status.event.player, target);
						if (att > 0) {
							if (target.hp == 1) {
								att += 2;
							}
							if (target.hp < target.maxHp) {
								att += 2;
							}
						}
						return att;
					})
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				await target.gainMaxHp();
				await target.recover();
				await target.addSkills('mengjiyi');
				target.gain(player.getCards('hej'), player, 'giveAuto');
			},
			ai: {
				threaten(player, target) {
					if (target.hp == 1) return 2;
					return 0.5;
				},
			}
		},
		"mengezhan_info": "恶战|回合外，其他角色以你为唯一目标使用牌后，你可以将一张手牌当无距离限制的【杀】对其使用；<br>出牌阶段，你对其他角色使用目标唯一的牌后，目标角色可以将一张手牌当【杀】对你使用。",
		"mengzhuoshi_info": "灼蚀|锁定技，当你受到伤害时，改为减少X点的体力上限并摸X张牌（X为伤害值）。",
		"mengjiyi_info": "疾疫|锁定技，你的手牌上限等于体力上限。你使用的【杀】改为火【杀】，其他角色响应你的【杀】后须弃置一张手牌。",
		"mengzhicheng_info": "志承|当你死亡时，你可以令一名其他角色增加一点体力上限并回复1点体力，然后令其获得技能〖疾疫〗和你区域内的所有牌。",
	},
	2309: {
		hyyz_xt_danhengyinyue: ['丹恒·饮月', ["male", "hyyz_xt", 4, ["hyyznilin", "hyyzwangtu"], []], '紫灵谷的骊歌', '罗浮龙尊，掌苍龙之传。行云布雨，膺责守望不死建木。尊号「饮月君」。'],
		hyyznilin: {
			audio: 6,
			init(player) {
				player.storage.hyyznilin = [[], []];
			},
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				return event.filterCard({ name: 'sha' }, player, event);
			},
			chooseButton: {
				dialog(event, player) {
					var list = [];
					if (event.filterCard({ name: 'sha' }, player, event)) {
						list.push(['基本', '', 'sha'])
						for (var nature of lib.inpile_nature) {
							if (event.filterCard({ name: 'sha', nature: nature }, player, event)) list.push(['基本', '', 'sha', nature]);
						}
					}
					if (player.countCards('h') > 0) var list1 = player.getCards('h');
					else var list1 = '你没有手牌';
					var list2 = get.cards(3);
					for (var i = 2; i >= 0; i--) {
						ui.cardPile.insertBefore(list2[i], ui.cardPile.firstChild);
					}
					return ui.create.dialog('逆鳞', [list, 'vcard'], '你的手牌', list1, '牌堆顶的牌', list2, 'hidden');
				},
				check(button) {
					let player = _status.event.player;
					let card = button.link;
					if (get.itemtype(card) == 'card') {
						return 10 - (_status.event.currentPhase == player ? player.getUseValue(card) : get.value(card)) / (card.name == 'sha' ? 10 : 1);
					}
					else {
						if (card[3] == 'hyyz_quantum') return 2.97 + player.getUseValue({ name: card[2], nature: [3] });
						else if (card[3] == 'fire') return 2.95 + player.getUseValue({ name: card[2], nature: [3] });
						else if (card[3] == 'hyyz_wind') return 2.93 + player.getUseValue({ name: card[2], nature: [3] });
						else if (card[3] == 'thunder') return 2.91 + player.getUseValue({ name: card[2], nature: [3] });
						else return 2.9 + player.getUseValue({ name: card[2], nature: [3] });
					}
				},
				select: 4,
				filter(button, player) {
					if (ui.selected.buttons.length) {
						if (ui.selected.buttons.some(i => get.position(i.link) == undefined)) return get.position(button.link);
						if (ui.selected.buttons.length == 3) return !get.position(button.link);
					}
					return true
				},
				backup(links, player) {
					let cards = [], views = [];
					cards = links.filter(i => get.position(i));
					views = links.filter(i => !get.position(i));
					return {
						filterCard(card) {
							return false;
						},
						selectCard: -1,
						cards: cards,
						viewAs: {
							name: views[0][2],
							nature: views[0][3],
						},
						precontent() {
							player.logSkill('hyyznilin');
							event.result.cards = lib.skill[event.result.skill].cards;
						},
						onuse(result, player) {
							let cards0 = lib.skill[result.skill].cards;
							let num = cards0.filter(link => player.getCards('h').includes(link)).length;

							var cards = [];
							while (cards.length < num) {
								var card = get.cardPile(function (card) {
									return !cards0.includes(card) && !cards.includes(card);
								});
								if (card) cards.push(card);
							}
							if (cards.length) {
								game.log(player, '摸了' + get.cnNumber(num) + '张牌');
								player.gain(cards, 'draw');
							}
							//player.awakenSkill('hyyznilin');
							//player.when('phaseAfter').then(() => {
							//    player.restoreSkill('hyyznilin');
							//})
						},
						onrespond(result, player) {
							player.draw(lib.skill[result.skill].cards.length);
						},
					}
				},
				prompt(links, player) {
					let views = links.filter(i => !get.position(i));
					return '选择【' + get.translation(views[0][3] || '') + get.translation(views[0][2]) + '】的目标';
				},
			},
			hiddenCard(player, name) {
				return name == 'sha';
			},
			mod: {
				targetInRange(card) {
					if (_status.event.skill == 'hyyznilin_backup') return true;
				},
				selectTarget(card, player, range) {
					if (range[1] == -1) return;
					let evt = _status.event;
					if (evt.skill == 'hyyznilin_backup') {
						if (evt._result && evt._result.links && evt._result.links.length) {
							let cards = evt._result.links.filter(link => get.itemtype(link) == 'card' && player.getCards('h').includes(link))
							let num = cards.length;
							if (typeof num == 'number' && num > range[1]) range[1] = num;
						}
					}
				}
			},
			ai: {
				effect: {
					target(card, player, target, effect) {
						if (get.tag(card, 'respondSha')) return 0.7;
					},
				},
				order: 11,
				respondSha: true,
				result: {
					player(player) {
						return 1;
					},
				},
			},
		},
		"hyyznilin_info": "逆鳞|你可以观看并在<span class='thundertext'>牌堆顶三张牌和手牌</span>中选择三张当任意【杀】使用或打出。<br>此【杀】无距离限制，目标上限为X且你摸X张牌，X为此【杀】包含的手牌数。",
		hyyzwangtu: {
			audio: 2,
			trigger: {
				target: 'useCardToTargeted',
			},
			forced: true,
			async content(event, trigger, player) {
				if (!player.hasSkill('hyyzwangtu_buff')) player.addTempSkill('hyyzwangtu_buff', 'roundStart');
				player.storage.hyyzwangtu_buff++;
				player.syncStorage('hyyzwangtu_buff');
				player.updateMark('hyyzwangtu_buff');
			},
			subSkill: {
				buff: {
					init(player, skill) {
						player.storage.hyyzwangtu_buff = 0;
					},
					mark: true,
					intro: {
						markcount(storage, player) {
							return ('+' + storage);
						},
						content(storage) {
							return '其他角色计算与你的距离+' + storage;
						},
					},
					mod: {
						globalTo(from, to, distance) {
							if (typeof to.storage.hyyzwangtu_buff == 'number') {
								return distance + to.storage.hyyzwangtu_buff;
							}
						},
					},
				}
			}
		},
		"hyyzwangtu_info": "亡途|锁定技，当你成为一张牌的目标后，本轮其他角色计算与你的距离+1。",

		hyyz_b3_kaiwen: ['凯文', ["male", "hyyz_b3", 4, ["hyyzqishuang", "hyyzshenghen", "hyyzjiushi"], ['zhu',]], '紫灵谷的骊歌', '凯文·卡斯兰娜，第一文明纪元联合国下属对崩坏组织“逐火之蛾”的十三英桀之首，位次“I”，刻印为“救世”。人类最强大的保护者，最接近逐火之蛾宏愿的人，被所有人承认的“英雄”。世人坚信，他终将带领人类战胜崩坏。'],//die：bgm代替
		hyyzqishuang: {
			audio: 3,
			trigger: {
				source: "damageBegin1",
			},
			forced: true,
			filter: (event, player) => !event.nature,
			async content(event, trigger, player) {
				game.setNature(trigger, player.countCards('e', (card) => card.name.includes('tianhuo')) > 0 ? 'fire' : 'ice');
			},
		},
		hyyzqishuang_info: "欺霜|锁定技，你造成的普通伤害视为冰属性（若你已装备【天火圣裁】系列武器，则改为火属性）。",
		hyyzshenghen: {
			audio: 5,
			enable: "phaseUse",
			usable: 1,
			filterTarget(card, player, target) {
				if (target == player) return false;
				if (ui.selected.targets.length) {
					for (var i of ui.selected.targets) {
						if (i.hp == target.hp) return false;
					}
				}
				return true;
			},
			selectTarget: [1, Infinity],
			complexTarget: true,
			multiline: true,
			async content(event, trigger, player) {
				const { cards } = await event.target.chooseToUse(function (card, player, event) {
					if (get.type(card) == 'equip') return false;
					return lib.filter.cardEnabled.apply(this, arguments);
				}, '是否使用一张非装备牌？', '若你使用，则凯文获得之；<br>否则翻面或被杀')
					.forResult();
				if (cards) {
					await player.gain(cards, 'gain2');
				} else {
					const { control } = await event.target.chooseControl('翻面', '被杀')
						.set('ai', function () {
							let target = _status.event.player;
							if (target.isTurnedOver()) return '翻面';
							if (target.hp > 1) return '被杀';
							return '翻面';
						})
						.forResult();
					if (control == '被杀') {
						await player.recover();
						await player.useCard({ name: 'sha', isCard: true }, event.target, false);
					} else {
						await event.target.turnOver();
					}
				}
			},
			ai: {
				order: 4,
				expose: 0.2,
				result: {
					target(player, target) {
						let att = get.attitude(player, target);
						let value = 0;
						if (att > 0) {
							if (target.countCards('h') >= 5) value += 2;
							if (target.isTurnedOver()) value += 5;
						} else {
							value -= 2;
							if (!target.countCards('h', { name: 'sha' })) value -= 2;
						}
						return value;
					},
				},
			}
		},
		hyyzshenghen_info: "圣痕|出牌阶段限一次，选择任意体力值不同的其他角色，这些角色选择一项：1.使用一张非装备牌且你获得之；2.你回复1点体力并视为对其使用【杀】；3.翻面。",
		hyyzjiushi: {
			audio: 2,
			skillAnimation: "epic",
			animationColor: "fire",
			animationStr: '业魔入渊,劫灭出鞘',
			juexingji: true,
			trigger: {
				global: "dieAfter",
			},
			filter(event, player) {
				return game.dead && game.dead.length >= game.filterPlayer().length;
			},
			forced: true,
			async content(event, trigger, player) {
				player.awakenSkill(event.name);
				player.storage[event.name] = true;
				var num = 0;
				game.countPlayer(function (current) {
					if (current != player) num += current.maxHp;
				})
				await player.gainMaxHp(num);
				await player.changeGroup("shen");
				await game.delay();

				const card = lib.skill.hyyzjiushi.equip();
				if (card) await player.equip(card);
				else game.log('#g【天火圣裁】', '不在游戏中');

				player.say('此即，救世之铭！');
				await player.addSkills('hyyzyemo');
			},
			derivation: ["hyyzyemo"],
			equip() {
				let card;
				card = get.cardPile((card) => card.name.includes('tianhuo'));
				if (!card) {
					let players = game.filterPlayer();
					for (let current of players) {
						if (current.countCards('hej', (card) => card.name.includes('tianhuo')) > 0) {
							card = current.getCards('hej', (card) => card.name.includes('tianhuo'))[0];
						};
						if (card) break;
					}
				}
				return card;
			}
		},
		hyyzjiushi_info: "救世|觉醒技,一名角色死亡后，若至少有一半的角色阵亡，你将体力上限改为存活角色的体力上限之和，势力改为神，然后装备【天火圣裁】并获得〖业魔〗。",
		hyyzyemo: {
			audio: 4,
			trigger: {
				player: ["loseHpBefore", "damageBegin4"],
				source: 'damageBegin3',
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'damage' && event.source && event.source == player) return player.getHistory('sourceDamage').length > 0
				else return true;
			},
			async content(event, trigger, player) {
				let num;
				if (trigger.name == 'damage' && trigger.source && trigger.source == player) {
					num = player.getHistory('sourceDamage').length;
					trigger.num += num;
				}
				else {
					num = trigger.num;
					trigger.cancel();
				};
				await player.loseMaxHp(num);
			},
			group: "hyyzyemo_equip",
			subSkill: {
				equip: {
					audio: 'hyyzyemo',
					trigger: {
						player: "phaseZhunbeiBegin",
					},
					filter(event, player) {
						if (player.getEquips('equip1').some(card => card.name.includes('tianhuo'))) return false;
						const card = lib.skill.hyyzjiushi.equip();
						return card;
					},
					forced: true,
					async content(event, trigger, player) {
						const card = lib.skill.hyyzjiushi.equip();
						if (card) await player.equip(card);
						else game.log('#g【天火圣裁】', '不在游戏中');
					},
				}
			},
			mod: {
				aiValue(player, card, num) {
					if (card.name.includes('tianhuo')) return 100;
				},
			},
		},
		"hyyzyemo_info": "业魔|锁定技，准备阶段，你装备【天火圣裁】系列武器。 当你造成伤害时，此伤害值加X且你减X点体力上限（X为你本回合造成伤害的次数）。当你受到伤害或失去体力时，改为减体力上限。",

		hyyz_ɸ_shaoxia: ['少侠', ["male", "qun", 4, ["mengweie", "mengmushou"], ["zhu"]], '以身为铒，邀天下人入局-尾巴酱', '<br>扩展包中第一个以公益为目的创作的武将，无侮辱、轻佻、歧视、玩笑等含义，武将的初衷在于让大家记住平民英雄。如有冒犯，即刻删除。'],
		mengweie: {
			trigger: {
				global: "roundStart",
			},
			locked: true,
			async cost(event, trigger, player) {
				const targetsx = game.filterPlayer(current => current.hasSkill('mengshuguang'));
				let str = targetsx.length > 0 ? '或点取消令' + get.translation(targetsx) + '摸两张牌' : ''
				const { bool, targets } = await player
					.chooseTarget('伪恶：将〖曙光〗转移给一名角色并视为对其造成过1点伤害', str, function (card, player, target) {
						return !target.hasSkill('mengshuguang')
					})
					.set('ai', function (target) {
						var att = get.attitude(player, target);
						if (!game.countPlayer(function (current) {
							return current.hasSkill('mengshuguang')
						})) {
							if (target == player) att /= 2;
							if (get.damageEffect(target, player, target) * 10 > 0) att *= 10
							return att;
						} else return false;
					})
					.forResult()
				if (bool) {
					event.result = {
						bool: true,
						targets: targets,
						cost_data: true
					}
				} else {
					event.result = {
						bool: true,
						targets: targetsx,
						cost_data: false
					}
				}
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				if (event.cost_data == true) {
					const shuguangs = game.filterPlayer((current) => current.hasSkill('mengshuguang'))
					for (let i of shuguangs) {
						await i.removeSkills('mengshuguang')
					}
					await target.damage(player, 'unreal');
					await target.addSkills('mengshuguang');
				} else {
					await target.draw(2)
				}
			},
			derivation: 'mengshuguang',
			group: 'mengweie_die',
			subSkill: {
				die: {
					trigger: {
						player: 'dieBegin',
					},
					forceDie: true,
					forced: true,
					charlotte: true,
					content() {
						game.countPlayer(function (current) {
							if (current.hasSkill('mengshuguang')) {
								player.say('对不起，我尽力了……');
								current.removeSkill('mengshuguang');
							}
						})
					}
				}
			}
		},
		mengshuguang: {
			mark: true,
			marktext: '曙',
			intro: {
				name: '曙光',
				name2: '曙',
				content: '此计若成，我儿有救矣！',
			},
			trigger: {
				global: "loseAfter",
			},
			filter(event, player) {
				if (event.type != 'discard' || event.getlx === false) return false;
				var cards = event.cards.slice(0);
				var evt = event.getl(player);
				if (evt && evt.cards) cards.removeArray(evt.cards);
				return cards.some(card => card.original != 'j' && get.type(card) == 'basic' && get.position(card) == 'd')
			},
			async cost(event, trigger, player) {
				if (trigger.delay == false) game.delay();
				let cards = [], cards2 = trigger.cards.slice(0), evt = trigger.getl(player);
				if (evt && evt.cards) cards2.removeArray(evt.cards);
				cards = cards2.filter(card => card.original != 'j' && get.type(card) == 'basic' && get.position(card) == 'd')
				if (cards.length) {
					event.result = await trigger.player
						.chooseBool('曙光：' + get.translation(player) + '需要善款，将这些用不上的物资捐助给他吧', get.translation(cards))
						.set('ai', () => get.attitude(trigger.player, player) > 0)
						.forResult()
					event.result.cards = cards
				}
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				player.gain(event.cards, 'gain2', 'log').giver = trigger.player;
				player.say(['谢谢好心人！', '好人一生平安！', '我实在无以回报……'].randomGet());
			},
			mod: {
				maxHandcard(player, num) {
					return num + 2;
				},
			}
		},
		mengmushou: {
			mod: {
				targetEnabled(card) {
					if ((get.type(card) == 'trick' || get.type(card) == 'delay') &&
						get.color(card) == 'black') return false;
				},
			},
			init(player) {
				player.storage.mengmushou = 0;
			},
			trigger: {
				global: 'gainAfter',
			},
			filter(event, player) {
				return event.player.hasSkill('mengshuguang');
			},
			forced: true,
			dutySkill: true,
			async content(event, trigger, player) {
				player.storage.mengmushou += trigger.cards.length;
				game.log('#g【幕手】', '捐款+' + trigger.cards.length)
				player.addTip('mengmushou', '幕手' + player.storage.mengmushou)
			},
			group: ['mengmushou_achieve', 'mengmushou_fail'],
			subSkill: {
				achieve: {
					trigger: {
						global: 'gainAfter'
					},
					forced: true,
					skillAnimation: true,
					animationColor: 'fire',
					filter(event, player) {
						return player.storage.mengmushou >= 28;
					},
					async content(event, trigger, player) {
						game.log(player, '成功完成使命');
						player.awakenSkill('mengmushou');
						player.removeTip('mengmushou')
						await player.gainMaxHp(2);
						await player.recover(2);
						await player.addSkills('mengshentui');
					},
				},
				fail: {
					trigger: {
						global: 'dying'
					},
					forced: true,
					filter(event, player) {
						return event.player.hasSkill('mengshuguang');
					},
					async content(event, trigger, player) {
						game.log(player, '使命失败');
						player.awakenSkill('mengmushou');
						player.removeTip('mengmushou')
						await player.loseMaxHp(2);
						await trigger.player.recover(2);
						player.addSkills('mengshentui');
					},
				},
			},
			derivation: 'mengshentui',
		},
		mengshentui: {
			trigger: {
				global: "useCard",
			},
			forced: true,
			filter(event, player) {
				if (event.player == event.targets[0]) return false;
				if (event.targets.length != 1) return false;
				if (player != event.targets[0] && player != event.player) return false;
				return event.card && (get.type(event.card) == 'trick' || get.type(event.card) == 'basic' && !['shan', 'tao', 'jiu', 'du'].includes(event.card.name));
			},
			async content(event, trigger, player) {
				var target = trigger.player.maxHp > trigger.targets[0].maxHp ? trigger.targets[0] : trigger.player;
				trigger.directHit.add(target);
			},
		},
		"mengweie_info": "伪恶|锁定技，每轮开始时，令有〖曙光〗的角色摸两张牌，或将〖曙光〗转移给一名角色并视为对其造成过1点伤害。",
		"mengshuguang_info": "曙光|你的手牌上限+2。其他角色弃置基本牌后，可以将这些牌交给你。",
		"mengmushou_info": "幕手|使命技。锁定技，你不能成为黑色锦囊牌的目标。<br><span class=greentext>成功</span>：有〖曙光〗的角色获得二十八张牌后，你加两点体力上限并回复2点体力。<br><span class=firetext>失败</span>：有〖曙光〗的角色进入濒死状态时，你减2点体力上限并令其回复2点体力。<br><hr><span class=thundertext>〖幕手〗失效后，你获得〖身退〗。</span>",
		"mengshentui_info": "身退|你对/被其他角色使用单体即时牌时，体力上限较小的一方不能响应此牌。",

		hyyz_b3_sp_jiziwuliangta: ['姬子', ["female", "hyyz_b3", "4/6", ["mengnuwu", "mengjiezhan", "mengxinhuo"], ['die:hyyz_b3_jiziwuliangta']], '柚衣', '尾巴已对技能〖薪火〗〖薪炎〗进行修改，若有其他方案可私信尾巴修改。'],
		mengnuwu: {
			audio: 'hyyzxiepin',
			trigger: {
				player: "damageBegin",
				source: "damageBegin",
			},
			usable: 1,
			filter(event, player) {
				return event.num > 0;
			},
			maxhp(target1, target2, player) {
				//数组，输入（角色1，角色2，视角）根据两名角色，判定体力值较高的一方，返回[该角色，名字/你]
				if (!target1 || !target1.isIn() ||
					!target2 || !target2.isIn() ||
					target1.hp == target2.hp) return [];
				var target = target1.hp > target2.hp ? target1 : target2;
				return [target, target == player ? '你' : get.translation(target)];
			},
			prompt(event, player) {
				var list = lib.skill.mengnuwu.maxhp(event.player, event.source, player);
				return `女武：${list.length && list[0] != player ? list[1] + '失去1点体力，' : ''}你摸${event.num * 2}张牌`;
			},
			async content(event, trigger, player) {
				let max = lib.skill.mengnuwu.maxhp(trigger.player, trigger.source, player);
				if (max.length > 0 && max[0] != player) await max[0].loseHp();
				await player.draw(trigger.num * 2);
			},
		},
		mengjiezhan: {
			audio: 'hyyzpoxiao',
			trigger: {
				player: "useCard",
			},
			filter(event, player) {
				return get.timetype(event.card) == 'notime' && get.tag(event.card, 'damage');
			},
			async cost(event, trigger, player) {
				const { control } = await player
					.chooseControl('baonue_hp', 'baonue_maxHp', 'cancel2', function (event, player) {
						let zhu = false;
						switch (get.mode()) {
							case 'identity': {
								zhu = player.isZhu;
								break;
							}
							case 'guozhan': {
								zhu = get.is.jun(player);
								break;
							}
							case 'versus': {
								zhu = player.identity == 'zhu';
								break;
							}
							case 'doudizhu': {
								zhu = player == game.zhu;
								break;
							}
						}
						if (zhu && player.hp <= 3) return false;
						if (player.hp == player.maxHp) return 'baonue_hp';
						if (player.hp < player.maxHp - 1 || player.hp <= 2) return 'baonue_maxHp';
						return 'baonue_hp';
					})
					.set('prompt', '竭战：是否【崩坏】，令此牌不能被响应且不计入使用次数？')
					.forResult();
				if (control && control != 'cancel2') {
					event.result = {
						bool: true,
						cost_data: {
							control: control
						}
					}
				}
			},
			async content(event, trigger, player) {
				const control = event.cost_data.control;
				if (control == 'baonue_hp') await player.loseHp();
				else await player.loseMaxHp(true);

				trigger.directHit.addArray(game.players);
				if (player.getStat().card[trigger.card.name] > 0) player.getStat().card[trigger.card.name]--;
				const { targets } = await player
					.chooseTarget('令一名角色随机获得一张红色牌', true)
					.set('ai', function (target) {
						return get.attitude(_status.event.player, target)
					})
					.forResult();
				if (targets) {
					let card = get.cardPile2((card) => get.color(card) == 'red');
					if (card) targets[0].gain(card, 'gain2');
				}
			},
		},
		mengxinhuo: {
			audio: 'hyyzhuozhong',
			trigger: {
				player: "dying",
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget(get.prompt2('mengxinhuo'), lib.filter.notMe)
					.set('ai', function (target) {
						var att = get.attitude(_status.event.player, target);
						if (att > 0) {
							if (target.hp == 1) {
								att += 2;
							}
							if (target.hp < target.maxHp) {
								att += 2;
							}
						}
						return att;
					})
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				await target.addSkills('mengxinyan');
				await target.gain(player.getCards('he'), player, 'giveAuto');
				const num = player.maxHp;
				await player.loseMaxHp(num);
				await target.gainMaxHp(num);
			},
			derivation: 'mengxinyan'
		},
		mengxinyan: {
			trigger: {
				player: "useCard",
			},
			locked: true,
			filter(event, player) {
				return event.card && get.color(event.card) == 'red'
			},
			async content(event, trigger, player) {
				const { control } = await player
					.chooseControl('增加火属性', '伤害+1', '背水！')
					.forResult();
				event.result = {
					bool: true,
					cost_data: control
				}
			},
			async content(event, trigger, player) {
				const control = event.cost_data;
				if (control != '伤害+1') {
					game.setNature(trigger.card, "fire");
					trigger.card.storage.mengxinyan ? trigger.card.storage.mengxinyan += 1 : trigger.card.storage.mengxinyan = 1;
				}
				if (control != '增加火属性') {
					trigger.card.storage.mengxinyan ? trigger.card.storage.mengxinyan += 2 : trigger.card.storage.mengxinyan = 2;
				}
				if (control == '背水！') {
					player.hyyzDianran(player.getCards('h', { color: 'red' }));
				}
			},
			group: 'mengxinyan_1',
			subSkill: {
				1: {
					trigger: {
						source: 'damageBegin1'
					},
					filter(event, player) {
						return event.card?.storage.mengxinyan > 0
					},
					forced: true,
					async content(event, trigger, player) {
						const num = trigger.card.storage.mengxinyan;
						if (num != 1) {
							trigger.num++;
						}
						if (num != 2) {
							game.setNature(trigger, "fire");
						}
					}
				}
			}
		},
		"mengnuwu_info": "女武|锁定技，你每回合首次造成或受到伤害时，体力值较大的一方失去1点体力，然后你摸两倍于伤害值的牌。",
		"mengjiezhan_info": "竭战|当你使用伤害即时牌时，你可以〖崩坏〗并令此牌不可响应且不计次数，然后令一名角色获得一张红色牌。",
		"mengxinhuo_info": "薪火|当你进入濒死状态时，你可以选择一名角色，将〖薪炎〗、所有牌和体力上限转移给该角色。",
		"mengxinyan_info": "薪炎|锁定技，你使用红色牌时：①增加火属性；②伤害+1；" + get.hyyzIntroduce('背水') + "：" + get.hyyzIntroduce('点燃') + "红色手牌。",

		hyyz_ys_shenlilingren: ['神里绫人', ["male", "hyyz_ys", 3, ["mengwenmou", "menggutu"], []], '微雨', '尾巴已对技能〖稳谋〗〖固图〗进行修改，若有其他方案可私信尾巴修改。'],
		mengwenmou: {
			audio: 2,
			trigger: {
				player: ["useCard", "respond"],
			},
			frequent: true,
			async content(event, trigger, player) {
				if (player.countCards('h', function (card) {
					return get.suit(trigger.card) == get.suit(card);
				}) > 0) {
					if (trigger.card.name == 'sha') player.getStat().card.sha--;
					if (trigger.card.name == 'jiu') player.getStat().card.jiu--;
				} else {
					player.draw()
				}
			},
			ai: {
				"maixie_defend": true,
				effect: {
					target(card, player, target) {
						if (target.countCards('h') > 3) return [1, 5];
						if (get.attitude(target, player) < 0) return [1, 1];
					},
				},
			}
		},
		menggutu: {
			audio: 3,
			trigger: {
				player: ["useCard", "respond"],
			},
			preHidden: true,
			filter(event, player) {
				return event.respondTo && event.respondTo[0] != player
			},
			priority: 2,
			forced: true,
			async content(event, trigger, player) {
				const { color } = await player
					.judge(function (card) {
						if (player.hp == player.maxHp) {
							if (get.color(card) == "red") return -1;
						}
						if (get.color(card) == "red") return 1;
						return 0;
					})
					.forResult();
				if (color) switch (color) {
					case "red":
						if (player.hp < player.maxHp) player.recover();
						break;
					case "black":
						player.draw();
						break;
					default:
						break;
				}
			},
		},
		"mengwenmou_info": "稳谋|当你使用或打出牌时，若你手牌中有此牌的花色，此牌不计入使用次数；否则，摸一张牌。",
		"menggutu_info": "固图|锁定技，你响应其他角色的牌时对自己发动一次〖恢拓〗。",

		hyyz_b3_lizhilvzhe: ['理之律者', ["female", "shen", 3, ["mengsheyuan", "mengkanming"], []], '绯色愫', '尾巴已对技能〖涉渊〗〖堪名〗进行修改，若有其他方案可私信尾巴修改。'],
		mengsheyuan: {
			audio: 3,
			onremove: true,
			intro: {
				name: "涉渊",
				mark(dialog, content, player) {
					if (player == game.me || player.isUnderControl()) {
						dialog.add([player.getStorage('mengsheyuan'), 'vcard']);
						dialog.addText('包含的类型')
						dialog.addText(player.getStorage('mengsheyuan').map(name => get.translation(get.type2(name))).unique().join('、'))
					} else {
						dialog.addText('偷看女孩子的记录可是不礼貌的哦！');
					}
				},
			},
			trigger: {
				global: 'phaseAfter',
			},
			filter(event, player) {
				if (event.player == player) return false;
				return get.centralCards().some(card => get.type2(card) != 'equip') ||
					player.getStorage('mengsheyuan')?.some(name => !['trick', 'equip', 'basic'].includes(get.type2(name))) && !game.getGlobalHistory('everything', (evt) => evt.player == player && evt.name == "disableEquip").length
			},
			frequent: true,
			async content(event, trigger, player) {
				const names = get.centralCards()
					.filter(i => get.type(i) != 'equip')
					.map(i => get.name(i))
					.unique(),
					name = names.randomGet();
				player.storage.mengsheyuan ??= [];
				player.storage.mengsheyuan.add(name);
				game.log('【涉渊】记录了', '#g【' + get.translation(name) + '】');
				player.markSkill(event.name)

				if (!game.getGlobalHistory('everything', (evt) => evt.player == player && evt.name == "disableEquip").length) {
					const types = player.getStorage('mengsheyuan').map(i => get.type(i))
					let card1 = get.cardPile((card) => !types.includes(get.type2(card)));
					if (card1) await player.gain(card1, 'gain2');
					let card2 = get.cardPile((card) => !types.includes(get.type2(card)));
					if (card2) await player.gain(card2, 'gain2');
				}
			},
			subfrequent: ['lose'],
			group: 'mengsheyuan_lose',
			subSkill: {
				lose: {
					trigger: {
						player: "loseAfter",
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					frequent: true,
					filter(event, player) {
						if (!player.hasEnabledSlot()) return false;
						if (!player.getStorage('mengsheyuan')?.length) return false
						if (event.name == 'gain' && event.player == player) return false;
						var evt = event.getl(player);
						const lose = evt.cards2;
						if (!evt || !lose) return false
						const storage = player.getStorage('mengsheyuan'), types = storage.map(name => get.type2(name));
						return lose.some(card => storage.includes(get.name(card)) || types.includes(get.type2(card)))
					},
					async cost(event, trigger, player) {
						const lose = trigger.getl(player).cards2;
						const storage = player.getStorage('mengsheyuan'), types = storage.map(name => get.type2(name));
						let includesType = 0, includesName = 0;
						for (let card of lose) {
							if (types.includes(get.type2(card))) includesType = 1;
							if (storage.includes(get.name(card))) includesName = 2;
						}
						let num = Math.min(player.countEnabledSlot(), (includesName + includesType))
						if (num > 0) {
							event.result = {
								bool: true,
								cost_data: num
							}
						}
					},
					async content(event, trigger, player) {
						let num = event.cost_data;
						while (num > 0 && player.countEnabledSlot() > 0) {
							num--;
							await player.chooseToDisable()
						}
					}
				},
			}
		},
		mengkanming: {
			audio: 2,
			enable: ["chooseToUse",],
			filter(event, player) {
				if (!player.getStorage('mengsheyuan')?.length) return false;
				if (player.hasEnabledSlot() || !player.countCards('hse')) return false;
				if (event.name == 'chooseToRespond' && event.responded) return false;
				return player.getStorage('mengsheyuan').some(name => event.filterCard({ name: name, isCard: true }, player, event))
			},
			usable: 1,
			chooseButton: {
				dialog(event, player) {
					var list = [];
					var names = player.getStorage('mengsheyuan');
					for (var i of names) {
						if (i == 'sha') {
							if (!event.filterCard({ name: i }, player, event)) continue;
							list.push(['基本', '', 'sha']);
							for (var j of lib.inpile_nature) {
								if (event.filterCard({ name: i, nature: j }, player, event)) list.push(['基本', '', 'sha', j]);
							}
						}
						else if (get.type2(i) == 'trick') list.push(['锦囊', '', i]);
						else if (get.type(i) == 'basic') list.push(['基本', '', i]);
					}
					return ui.create.dialog('堪名', [list, 'vcard']);
				},
				filter(button, player) {
					return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
				},
				check(button) {
					if (_status.event.getParent().type != 'phase') return 1;
					var player = _status.event.player;
					if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
					return player.getUseValue({
						name: button.link[2],
						nature: button.link[3],
					});
				},
				backup(links, player) {
					return {
						audio: 'mengkanming',
						filterCard: true,
						check(card) {
							return 10 - get.value(card);
						},
						position: 'hes',
						viewAs: {
							name: links[0][2],
							nature: links[0][3],
							isCard: false,
						},
						async precontent(event, trigger, player) { },
					}
				},
				prompt(links, player) {
					return '将一张牌当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
				},
			},
			hiddenCard(player, name) {
				return player.countCards('hes') && player.getStorage('mengsheyuan', []).includes(name)
			},
			group: ['mengkanming_after'],
			subSkill: {
				after: {
					audio: 'mengkanming',
					trigger: {
						player: 'useCardAfter'
					},
					forced: true,
					filter(event, player) {
						if (event.skill != "mengkanming_backup") return false;
						return !game.getGlobalHistory('changeHp', (evt) => {
							return evt.num != 0 && evt.getParent().card == event.card
						}).length
					},
					async content(event, trigger, player) {
						let num = 0, bool = true;
						while (player.hasDisabledSlot() && bool) {
							var list = [];
							for (var i = 1; i <= 5; i++) {
								if (player.hasDisabledSlot(i)) {
									list.push("equip" + i);
								}
							}
							list.add('cancel2')
							const next = player.chooseControl(list);
							next.set("prompt", "是否恢复一个装备栏？");
							next.set('ai', (event, player) => list[0])
							const result = await next.forResult();
							if (result.control != 'cancel2') {
								num++;
								await player.enableEquip(result.control);
							} else {
								bool = false
							}
						}
						await player.draw(num)
						await player.recover(Math.floor(num / 2))
					}
				}
			},
			ai: {
				fireAttack: true,
				respondSha: true,
				respondShan: true,
				skillTagFilter(player) {
					if (player.countCards('hse') < 1) return false;
				},
				order: 1,
				result: {
					player(player) {
						if (_status.event.dying) return get.attitude(player, _status.event.dying);
						return 1;
					},
				},
			},
		},
		"mengsheyuan_info": "涉渊|其他角色的回合结束后，你记录本回合弃牌堆的一张随机非装备牌名；若本回合未废除过装备栏，你获得两张〖涉渊〗记录牌中缺失类型的牌。你失去牌后，若〖涉渊〗记录牌中包含此牌的类型/牌名，你废除1/2个装备栏。",
		"mengkanming_info": "堪名|每回合限一次，若你的装备栏均已废除，你可以将一张牌当〖涉渊〗记录牌使用。结算结束后，若没有角色因此牌改变体力值，你复原任意装备栏；每复原1/2个，你摸一张牌/回复1点体力。",

		hyyz_b3_sushang: ['李素裳', ["female", "hyyz_b3", 3, ["mengzhejian", "mengtaixu", "mengjianxin"], []], '微雨', '尾巴已对技能〖太虚〗进行修改，若有其他方案可私信尾巴修改。'],//
		mengzhejian: {
			audio: 2,
			trigger: {
				global: "mengzhejian",
			},
			direct: true,
			forced: true,
			locked: true,
			content() {
				player.draw();
			},
			mod: {
				globalFrom(from, to) {
					if (to.getEquip(1)) return -Infinity;
				},
			},
			group: "mengzhejian_gain",
			global: "mengzhejian_lose",
			subSkill: {
				lose: {
					trigger: {
						player: ["loseAfter"],
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					filter(event, player) {
						if (event.name == 'gain' && event.player == player) return false;
						var evt = event.getl(player);
						if (!evt || !evt.es || !evt.es.length > 0) return false;
						if (event.name == 'equip' && event.player == player) return false;
						for (var i of evt.es) {
							if (get.subtype(i, false) == 'equip1') return true;
						}
						return false;
					},
					forced: true,
					silent: true,
					popup: false,
					content() {
						game.hyyzSkillAudio('mengzhejian', 1)
						event.trigger('mengzhejian');
					},
					sub: true,
				},
				gain: {
					forced: true,
					silent: true,
					popup: false,
					trigger: {
						global: ["equipAfter"],
					},
					filter(event, player) {
						return get.subtype(event.card) == 'equip1';
					},
					content() {
						game.hyyzSkillAudio('mengzhejian', 2)
						event.trigger('mengzhejian');
					},
					sub: true,
				},
			},
		},
		mengtaixu: {
			audio: 2,
			trigger: {
				player: "useCardToPlayered",
			},
			filter(event, player) {
				if (event.targets.length != 1 || !event.cards || event.cards.length != 1) return false;
				return event.target.getEquips(1).length || event.target.hasEmptySlot(1);
			},
			prompt2(event, player) {
				if (event.target.getEquips(1).length) {
					return '获得' + get.translation(event.target.getEquips(1)) + '并令其本回合不能使用或打出牌';
				} else {
					return '将' + get.translation(event.cards[0]) + '置入其武器栏';
				}
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = trigger.targets[0];
				if (target.getEquips('equip1').length) {
					trigger.getParent().excluded.add(target);
					const cards = target.getCards('e', (card) => get.subtype(card) == 'equip1')
					await target.give(cards, player)
					await game.delay()
					await target.addhyyzBuff('hyyzBuff_dongjie');
				} else {
					let card = trigger.cards[0];
					if (get.subtype(card) != 'equip1') card = get.autoViewAs({ name: `hyyz_mengtaixu` }, trigger.cards);
					await target.equip(card);
				}
			},
		},
		mengjianxin: {
			audio: 2,
			trigger: {
				player: "shaBegin",
			},
			forced: true,
			filter(event, player) {
				return event.card.nature == 'ice' || get.natureList(event.card).includes('ice');
			},
			async content(event, trigger, player) { },
			group: ["mengjianxin_disable"],
			subSkill: {
				disable: {
					audio: "mengjianxin",
					trigger: {
						global: "gameDrawAfter",
						player: "enterGame",
					},
					forced: true,
					async content(event, trigger, player) {
						player.disableEquip(1);
					},
				}
			},
			mod: {
				cardname(card) {
					if (get.subtype(card, false) == 'equip1') return 'sha';
				},
				cardUsable(card, player) {
					if (!card.cards || card.name != 'sha') return;
					for (var i of card.cards) {
						if (lib.card[i.name].subtype == 'equip1') return Infinity;
					}
				},
				cardnature(card) {
					var info = get.translation(card.name);
					if (lib.card[card.name].subtype == 'equip1' && info.indexOf('剑') != -1) return 'ice';
				},
				targetInRange(card) {
					if (!card.cards || card.name != 'sha') return;
					for (var i of card.cards) {
						var info = get.translation(i.name);
						if (lib.card[i.name].subtype == 'equip1' && info.indexOf('剑') != -1) return true;
					}
				},
			},
		},
		"mengzhejian_info": "折剑|锁定技，当有牌进入或离开一名角色的武器栏后，你摸一张牌。你计算与武器栏内有牌的其他角色的距离为1。",
		"mengtaixu_info": "太虚|当你使用一张非虚拟牌指定唯一目标后，若目标角色的武器栏为空，你将此牌置入其武器栏；<br>否则，你改为获得该角色武器栏内的牌并" + get.hyyzIntroduce('冻结') + "其。",
		"mengjianxin_info": "剑心|锁定技，你没有武器栏。你的武器牌视为无次数限制的【杀】；若此牌的牌名包含“剑”，则此牌无距离限制且改为冰【杀】。",

		hyyz_b3_re_zhongyanzhilvzhe: ['终焉之律者', ["female", "hyyz_b3", 5, ["mengpingji_old", "mengzhaoxi_old", "mengcifan_old"], ['die:hyyz_b3_zhongyanzhilvzhe']], '拾壹', ''],
		mengpingji_old: {
			audio: "mengpingji",
			trigger: {
				global: 'damageEnd'
			},
			filter(event, player) {
				player.removeTip('mengpingji_old')
				if (!event.source) return false;
				return player.storage.mengpingji_old || player.countCards('he');
			},
			async cost(event, trigger, player) {
				if (player.storage.mengpingji_old) {
					var num = 0, list = player.storage.mengpingji_old;
					if (trigger.player == list['player']) {
						game.log('<li>目标均为：', trigger.player);
						num++;
					} else game.log('<li>目标不同');
					if (trigger.source == list['source']) {
						game.log('<li>来源均为：', trigger.source);
						num++;
					} else game.log('<li>来源不同');
					if (trigger.num == list['num']) {
						game.log('<li>点数均为：', trigger.num);
						num++;
					} else game.log('<li>点数不同');
					if (trigger.nature == undefined && list['nature'] == undefined) {
						game.log('<li>属性均为：', 'undefined');
						num++;
					} else if (trigger.nature == list['nature']) {
						game.log('<li>属性均为：', trigger.nature);
						num++;
					} else game.log('<li>属性不同');
					if (num > 0) {
						event.result = {
							bool: true,
							cost_data: num,
						}
					}
				} else {
					event.result = await player
						.chooseToDiscard('he', '平寂：你可以弃置一张牌并记录此伤害')
						.set('ai', function (card) {
							return 8 - get.value(card);
						})
						.forResult()
				}
			},
			async content(event, trigger, player) {
				if (player.storage.mengpingji_old) {
					delete player.storage.mengpingji_old;
					await player.draw(event.cost_data);
				} else {
					game.log('记录此伤害：<br>', '<li>属性：', trigger.nature, '<li>点数：', trigger.num, '<li>来源：', trigger.source, '<li>目标：', trigger.player);
					player.storage.mengpingji_old = {
						'nature': trigger.nature,
						'num': trigger.num,
						'source': trigger.source,
						'player': trigger.player,
					};
				}
			}
		},
		mengzhaoxi_old: {
			audio: "mengzhaoxi",
			mod: {
				cardname(card, player, name) {
					if (get.position(card) == 'h') {
						if (player.getHistory('gain', evt => evt && evt.cards && evt.cards.includes(card)).length) return 'huogong'
					}
				},
			},
			trigger: {
				global: 'useCardAfter'
			},
			filter(event, player) {
				if (event.targets.length != 1) return false;
				if (event.player == player || _status.currentPhase != event.player) return false;
				if (event.player.getHistory('useCard', evt => evt && evt != event && evt.targets.length == 1).length) return false;
				return player.canUse('huogong', event.targets[0]) && player.countCards('h', (card) => get.name(card) == 'huogong');
			},
			async cost(event, trigger, player) {
				const next = player.chooseToUse(function (card, player, event) {
					if (get.name(card) != 'huogong') return false;
					return lib.filter.cardEnabled.apply(this, arguments);
				});
				next.set('prompt', '朝夕：是否对' + get.translation(trigger.targets[0]) + '使用一张【火攻】？');
				next.set('filterTarget', function (card, player, target) {
					if (target != _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) return false;
					return lib.filter.targetEnabled.apply(this, arguments);
				})
				next.set('targetRequired', true)
				next.set('sourcex', trigger.targets[0]);
				event.result = await next.forResult()
			},
			async content(event, trigger, player) { },
		},
		mengcifan_old: {
			audio: "mengcifan",
			group: ['mengcifan_old_top', 'mengcifan_old_wugu'],
			subSkill: {
				top: {
					audio: 'mengcifan_old',
					trigger: {
						source: 'damageSource'
					},
					filter(event, player) {
						if (get.itemtype(event.cards) != 'cards') return false;
						for (var i of event.cards) {
							if (get.position(i, true) == 'o') return true;
						}
					},
					prompt(event, player) {
						return '赐繁：是否将' + get.translation(event.cards) + '置于牌堆顶？';
					},
					async content(event, trigger, player) {
						let cards = trigger.cards.filter(i => get.position(i, true) == 'o');
						if (cards.length > 1) {
							var next = await player.chooseToMove('赐繁：将牌按顺序置于牌堆顶');
							next.set('list', [['牌堆顶', cards]]);
							next.set('reverse', ((_status.currentPhase && _status.currentPhase.next) ? get.attitude(player, _status.currentPhase.next) > 0 : false));
							next.set('processAI', function (list) {
								var cards = list[0][1].slice(0);
								cards.sort(function (a, b) {
									return (_status.event.reverse ? 1 : -1) * (get.value(b) - get.value(a));
								});
								return [cards];
							});
							const { moved } = await next.forResult()
							if (moved) {
								cards = moved[0].slice(0);
							}
						}
						while (cards.length) {
							var card = cards.pop();
							if (get.position(card, true) == 'o') {
								card.fix();
								ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
								game.log(player, '将', card, '置于牌堆顶');
							}
						}
						game.updateRoundNumber();
					},
				},
				wugu: {
					audio: 'mengcifan_old',
					trigger: {
						global: 'dyingAfter'
					},
					filter(event, player) {
						return event.player.isAlive();
					},
					async cost(event, trigger, player) {
						var card = {
							name: 'wugu',
							isCard: true,
						}
						event.result = await player.chooseUseTarget('###是否发动【赐繁】？###视为使用一张【五谷丰登】', card, false, 'nodistance').forResult()
					},
					async content(event, trigger, player) { }
				},
			},
		},
		"mengpingji_old_info": "平寂|一名角色造成伤害后，若你没有记录，你可以弃置一张牌并记录此伤害的属性、数值、伤害来源和受伤角色；否则，你摸X张牌（X为此伤害与记录相同的项目数）并清除记录。",
		"mengzhaoxi_old_info": "朝夕|你不于当前回合内获得的牌均视为【火攻】。其他角色于其回合内首次使用目标唯一的牌后，你可以对同一目标使用一张【火攻】。",
		"mengcifan_old_info": "赐繁|当你使用牌造成伤害后，你可以将此牌置于牌堆顶。一名角色脱离濒死后，你可以视为使用一张【五谷丰登】。",

		hyyz_xt_sb_kafuka: ['卡芙卡', ["female", "hyyz_xt", 3, ["menglaixin", "mengyueluo"], ['die:hyyz_xt_kafuka']], '微雨', '尾巴已对技能〖来信〗〖悦落〗进行修改，若有其他方案可私信尾巴修改。'],
		menglaixin: {
			audio: 8,
			logAudio: () => false,
			trigger: {
				global: 'phaseBegin'
			},
			filter(event, player) {
				return event.player != player && player.countCards('he') > 0;
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseCard('he',
					'来信：你可以交给其一张牌，然后其执行一项',
					'1.将此牌交给你，然后与你各失去1点体力。<br>2.令你摸两张牌并移动场上一张牌。<br>3.与你各摸一张牌，然后本回合不能对你使用牌。')
					.set('ai', function (card) {
						var att = _status.event.att;
						if (att > 0) {
							return 6 - get.value(card);
						} else {
							if (player.hp <= 2) return 0;
							else return 10 - get.value(card);
						};
					})
					.set('att', get.attitude2(trigger.player))
					.forResult();
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				await player.give(event.cards, trigger.player, 'giveAuto');
				var name = get.translation(player);
				var list = [
					'将' + get.translation(event.cards) + '交给' + name + '，然后与' + name + '各失去1点体力。',
					'令' + name + '摸两张牌并移动场上一张牌',
					'与' + name + '各摸一张牌，然后本回合不能对' + name + '使用牌',
				]
				const { index } = await trigger.player.chooseControlList(list, '选择一项', true)
					.set('ai', function () {
						var targetx = _status.event.targetx;
						var playerx = _status.event.playerx;
						var att = get.attitude(targetx, playerx);
						if (att >= 0) {
							return 1;
						} else {
							if (get.effect(targetx, { name: 'losehp' }, targetx, targetx) >= 0) return 0;
							if (targetx.hp + targetx.countCards('h', 'tao') > playerx.hp + playerx.countCards('h', 'tao')) return 0;
							if (game.players.length != 2) return 2;
							return 1;
						}
					})
					.set('targetx', trigger.player)
					.set('playerx', player)
					.forResult();
				if (index != undefined) {
					switch (index) {
						case 0: {
							await trigger.player.loseHp();
							await player.loseHp();
							game.hyyzSkillAudio('menglaixin', 1, 2, 3, 4)
							await trigger.player.give(event.cards, player, 'giveAuto');
							break;
						}
						case 1: {
							game.hyyzSkillAudio('menglaixin', 5, 6)
							await player.draw(2);
							await player.moveCard();
							break;
						}
						case 2: {
							game.hyyzSkillAudio('menglaixin', 7, 8)
							await trigger.player.draw();
							await player.draw();
							trigger.player.addTempSkill('menglaixin_no');
						}
					}
				}
			},
			mod: {
				targetEnabled(card, player, target) {
					if (player.hasSkill('menglaixin_no')) return false;
				},
			},
			subSkill: {
				no: {
					charlotte: true,
					mark: true,
					intro: {
						content(player, storage) {
							return '不能对卡夫卡使用牌';
						},
					},
				}
			}
		},
		mengyueluo: {
			audio: 2,
			trigger: {
				player: "gainAfter",
				global: "loseAsyncAfter",
			},
			filter(event, player) {
				var evt = event.getParent('phaseDraw');
				if (evt && evt.player == player) return false;
				return event.getg(player).length > 0 && event.getParent(3).name != 'mengyueluo';
			},
			async cost(event, trigger, player) {
				const cards = trigger.getg(player);
				event.result = await player
					.chooseCardTarget({
						prompt: get.prompt('mengyueluo'),
						prompt2: '将其中一张红/黑色牌当【乐不思蜀】/【兵粮寸断】置入其他角色的判定区内。',
						cards: cards.filter(card => player.countCards('he', (cardx) => cardx == card)),
						filterCard(card) {
							return cards.includes(card);
						},
						filterTarget(card, player, target) {
							let cardx = get.autoViewAs({ name: get.color(ui.selected.cards[0], false) == 'red' ? 'lebu' : 'bingliang' }, ui.selected.cards);
							return player != target && target.canAddJudge(cardx)
						},
						ai1(card) {
							return 12 - get.value(card);
						},
						ai2(target) {
							let cardx = get.autoViewAs({ name: get.color(ui.selected.cards[0], false) == 'red' ? 'lebu' : 'bingliang' }, ui.selected.cards);
							return get.effect(target, cardx, player, player) || -get.attitude2(target);
						},
					})
					.forResult()
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				let cards = event.cards, target = event.targets[0];
				player.$give(cards, target);
				await target.addJudge({ name: get.color(cards[0], false) == 'red' ? 'lebu' : 'bingliang' }, event.cards);
				if (!game.hasPlayer(current => {
					if (current == player) return false;
					return trigger.getl(current).cards2.length;
				})) {
					await player.chooseDrawRecover();
					player.tempBanSkill('mengyueluo', { global: 'roundStart' })
				} else {
					await player.turnOver();
					await player.loseMaxHp();
					const card = get.autoViewAs({ name: 'sha', nature: 'thunder', isCard: true })
					await player.useCard(card, game.filterPlayer(current => current != player && player.canUse(card, current, false, false)));
				}
			},
		},
		"menglaixin_info": "来信|其他角色的回合开始时，你可以交给其一张牌，然后其选择一项：<br>1.与你各失去1点体力，然后将此牌交给你。<br>2.令你摸两张牌并移动场上一张牌。<br>3.与你各摸一张牌，然后本回合不能对你使用牌。",
		"mengyueluo_info": "悦落|当你于摸牌阶段外不因此技获得牌后，你可以将其中一张红/黑色牌当【乐不思蜀】/【兵粮寸断】置入其他角色的判定区内。若此牌来源不为其他角色，你回复1点体力或摸一张牌，且本轮此技失效；否则，你翻面并减1点体力上限，视为对所有其他角色使用一张雷【杀】。",

		hyyz_b3_luocha: ['罗刹人', ["male", "hyyz_b3", 3, ["mengnishang", "mengshouwang", "mengwenrun"], []], '柚衣', '尾巴已对技能〖温润〗进行修改，若有其他方案可私信尾巴修改。'],
		"mengnishang": {
			audio: 1,
			mod: {
				targetEnabled(card, player, target, now) {
					if (card.name == 'shunshou' || card.name == 'guohe') return false;
				},
			},
			global: "mengnishang_gain",
			subSkill: {
				gain: {
					audio: 'mengnishang',
					enable: "phaseUse",
					usable: 1,
					filter(event, player) {
						if (!game.countPlayer((current) => current.hasSkill('mengnishang'))) return false;
						return player.countCards('he') >= 2 && !player.hasSkill('mengnishang');
					},
					filterCard: true,
					position: 'he',
					selectCard: 2,
					discard: false,
					lose: false,
					delay: 0,
					filterTarget(card, player, target) {
						return target.hasSkill('mengnishang');
					},
					selectTarget() {
						if (game.countPlayer((current) => current.hasSkill('mengnishang')) > 1) return 1;
						return -1;
					},
					check(card) {
						if (card.name == 'du') return 20;
						if (get.owner(card).countCards('h') < get.owner(card).hp) return 0;
						return 5 - get.value(card);
					},
					async content(event, trigger, player) {
						let target = event.targets[0];
						await player.give(event.cards, target);
						const { cards } = await target
							.chooseCard('交给' + get.translation(player) + '一张牌', 'he', true, (card) => !event.cards.includes(card))
							.set('ai', (card) => 15 - get.value(card))
							.forResult()
						if (cards) await player.gain(cards, target, 'give');
					},
					ai: {
						order: 10,
						result: {
							player(player, target) {
								var val = 0.8;
								if (ui.selected.cards[0]) val -= get.value(ui.selected.cards[0]);
								if (ui.selected.cards[1]) val -= get.value(ui.selected.cards[1]);
								return val;
							},
							target: 2,
						}
					}
				},
			},
		},
		"mengshouwang": {
			audio: 2,
			trigger: {
				global: 'useCardToPlayered'
			},
			filter(event, player) {
				if (event.card.name != 'sha') return false;
				if (!player.countCards('he', function (card) {
					return get.type2(card) != 'trick';
				})) return false;
				var evt = lib.skill.mengshouwang.getLastUsed(event.player, event.getParent());
				if (!evt || !evt.card) return false;
				return evt.targets && evt.targets.includes(event.target);
			},
			getLastUsed(player, event) {
				var history = player.getAllHistory('useCard', function (evt) {
					return evt.card.name == 'sha' && evt.targets;
				}), index;
				if (event) index = history.indexOf(event) - 1;
				else index = history.length - 1;
				if (index >= 0) return history[index];
				return false;
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseCardTarget({
						prompt: get.prompt('mengshouwang'),
						prompt: '弃置一张非锦囊牌，对其攻击范围内的角色造成1点伤害',
						filterCard(card) {
							return get.type2(card) != 'trick';
						},
						position: 'he',
						filterTarget(card, player, target) {
							return trigger.player.inRange(target);
						},
						ai1(card) {
							return 8 - get.value(card);
						},
						ai2(target) {
							return get.damageEffect(target, player, player);
						}
					})
					.forResult();
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				await player.discard(event.cards);
				await event.targets[0].damage();
			},
		},
		"mengwenrun": {
			audio: 3,
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return player.countCards('e');
			},
			filterCard: true,
			position: 'e',
			filterTarget: true,
			check(card) {
				return 8 - get.value(card);
			},
			async content(event, trigger, player) {
				await event.target.recover();
				await event.target.addTempSkill('mengwenrun_buff', { player: 'phaseAfter' });
				if (!event.target.getEquips('equip1')?.length) event.target.draw();
			},
			ai: {
				order: 1,
				target(player, target) {
					return 2;
				}
			},
			subSkill: {
				buff: {
					charlotte: true,
					mark: true,
					marktext: '温',
					intro: {
						content: "出杀次数+1",
					},
					mod: {
						cardUsable(card, player, num) {
							if (card.name == 'sha') return num + 1
						},
					},
				}
			},
			"_priority": 0,
		},
		"mengnishang_info": "匿商|①锁定技，你不能成为【顺手牵羊】【过河拆桥】的目标。②其他角色的出牌阶段限一次，其可以交给你两张牌，然后令你交给其除这两张牌外的一张牌。",
		"mengshouwang_info": "守望|当一名角色使用【杀】指定其上一张【杀】包含的目标后，你可以弃置一张锦囊牌，对其攻击范围内的一名角色造成1点伤害。",
		"mengwenrun_info": "温润|出牌阶段限一次。你可以弃置一张装备区内的牌，令一名角色回复1点体力，直到该角色的回合结束，其使用【杀】的次数上限+1。若其武器栏内没有牌，其摸一张牌。",

		hyyz_ys_shenlilinghua: ['神里绫华', ["female", "hyyz_ys", 3, ["menglinren", "mengqingzi"], []], '七夕月', '尾巴已对技能〖凛刃〗〖倾姿〗描述进行优化，可联系尾巴复原技能。'],
		menglinren: {
			audio: 3,
			trigger: {
				player: 'useCard1'
			},
			filter(event, player) {
				if (!event.targets || event.targets.length != 1) return false;
				return event.card && (get.type(event.card) == 'trick' || get.type(event.card) == 'basic' && !['shan', 'tao', 'jiu', 'du'].includes(event.card.name));
			},
			check(event, player) {
				var types = lib.skill.menglinren.respond(event.card);
				var func = function (player) {
					var cards = player.getCards('h', function (card) {
						return types.includes(get.type2(card));
					});
					var val = 0;
					for (var i of cards) {
						val += get.value(i, player);
					};
					return [val, cards.length];
				}
				return func(player)[0] <= func(event.targets[0])[0] || func(player)[1] < 3;
			},
			respond(card) {
				const respond = [];
				if (get.type(card) == 'basic') respond.add('basic');
				else if (get.type(card) == 'trick') {
					respond.add('trick');
					if (['nanman', 'wanjian', 'juedou'].includes(card.name)) respond.add('basic');
				};
				return respond;
			},
			async content(event, trigger, player) {
				const types = lib.skill.menglinren.respond(trigger.card), target = trigger.targets[0]
				player.addTempSkill('menglinren_no');
				target.addTempSkill('menglinren_no');
				const cards1 = player.getCards('h', (card) => types.includes(get.type2(card)));
				const cards2 = target.getCards('h', (card) => types.includes(get.type2(card)));
				await player.swapHandcards(target, cards1, cards2)
				target.addGaintag(cards1, 'menglinren');
				player.addGaintag(cards2, 'menglinren');

				const { targets } = await player
					.chooseTarget('选择一名角色成为' + get.translation(event.card) + '的额外目标（无视合法性）')
					.set('ai', function (target) {
						var player = _status.event.player;
						var card = _status.event.getTrigger().card;
						return get.effect(target, card, player, player) && !_status.event.targetx.includes(target) || target == player;
					})
					.set('targetx', trigger.targets)
					.forResult()
				if (targets) {
					trigger.targets.add(targets[0]);
					game.log('#g【凛刃】', '强制更新此牌的目标为', '<li>' + get.translation(trigger.targets));
				}
			},
			subSkill: {
				no: {
					charlotte: true,
					mod: {
						"cardEnabled2"(card) {
							if (get.itemtype(card) == 'card' && card.hasGaintag('menglinren')) return false;
						},
						cardDiscardable(card) {
							if (card.hasGaintag('menglinren')) return false;
						},
					},
					onremove(player) {
						player.removeGaintag('menglinren');
					},
				}
			}
		},
		mengqingzi: {
			audio: 3,
			trigger: {
				global: 'useCard2'
			},
			forced: true,
			filter(event, player) {
				if (!event.targets.includes(player) && event.player != player) return false;
				return event.targets.length > 1;
			},
			async content(event, trigger, player) {
				if (trigger.targets.includes(player)) {
					game.log('#g【顷姿】', '将', player, '从目标中移除');
					trigger.targets.remove(player);
				}
				if (trigger.player == player) {
					game.log('#g【顷姿】', '此牌额外结算一次');
					trigger.effectCount++;
				}
				if (trigger.targets.length) {
					const { targets } = await player
						.chooseTarget('选择一个目标', '取消之，或其摸一张牌', function (card, player, target) {
							return _status.event.targetx.includes(target);
						})
						.set('targetx', trigger.targets)
						.set('ai', function (target) {
							var player = _status.event.player;
							return -get.effect(target, _status.event.getTrigger().card, player, player)
						})
						.forResult()
					if (targets) {
						const { control } = await player.chooseControl('此牌无效', '摸一张牌').forResult()
						if (control == '此牌无效') {
							game.log('#g【顷姿】', '此牌对', targets, '无效');
							trigger.excluded.add(targets);
						} else {
							targets[0].draw();
						}
					}
				}
			}
		},
		"menglinren_info": "凛刃|当你使用目标唯一的牌时1，你可以与目标角色交换手牌中可用于响应此牌的所有同类型的牌。若如此做，本回合你们无法使用、打出或弃置这些牌，然后你令一名角色加入此牌的目标。",
		"mengqingzi_info": "倾姿|锁定技，当一名角色使用目标不唯一的牌时2，若你为此牌目标，将你从目标中移除；若你为使用者，此牌额外结算一次。然后你可以取消此牌的一个目标，或令其中一个目标摸一张牌。",

		hyyz_ɸ_kuisangti: ['奎桑提', ["male", "hyyz_ɸ", 5, ["mengxuexing", "mengpijing", "mengaoan"], []], '流萤一生推', ''],
		mengxuexing: {
			audio: 6,
			logAudio: () => [
				"ext:忽悠宇宙/asset/character/audio/mengxuexing1",
				"ext:忽悠宇宙/asset/character/audio/mengxuexing2",
				"ext:忽悠宇宙/asset/character/audio/mengxuexing3",
			],
			trigger: {
				source: "damageSource"
			},
			forced: true,
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.addhyyzBuff('hyyzBuff_zhongshang');
			},
			group: 'mengxuexing_ohhh',
			subSkill: {
				ohhh: {
					audio: 'mengxuexing',
					logAudio: () => [
						"ext:忽悠宇宙/asset/character/audio/mengxuexing4",
						"ext:忽悠宇宙/asset/character/audio/mengxuexing5",
						"ext:忽悠宇宙/asset/character/audio/mengxuexing6",
					],
					forced: true,
					trigger: {
						player: "useCard",
					},
					filter(event, player) {
						if (!player.hasSkill('mengquansheng')) return false;
						return event.card && (get.type(event.card) == 'trick' || get.type(event.card) == 'basic' && !['shan', 'tao', 'jiu', 'du'].includes(event.card.name)) && game.hasPlayer(function (current) {
							return current.hashyyzBuff('hyyzBuff_zhongshang');
						});
					},
					async content(event, trigger, player) {
						trigger.directHit.addArray(game.filterPlayer(function (current) {
							return current.hashyyzBuff('hyyzBuff_zhongshang');
						}));
					},
					ai: {
						"directHit_ai": true,
						skillTagFilter(player, tag, arg) {
							return arg.target.hasSkill('mengkui');
						},
					},
				}
			}
		},
		mengpijing: {
			audio: 5,
			enable: "phaseUse",
			usable(skill, player) {
				return player.hasSkill('mengquansheng') ? 2 : 1
			},
			async content(event, trigger, player) {
				if (player.hujia > 0) {
					const num = player.hujia;
					player.changeHujia(-num);
					player.draw(player.hasSkill('mengquansheng') ? num + 1 : num);
				} else {
					await player.loseHp();
					player.changeHujia(player.hasSkill('mengquansheng') ? 3 : 2);
				}
			},
			ai: {
				order: 8,
				result: {
					player(player) {
						if (player.hp < 2 || player.hujia) return -1;
						return 1;
					},
				},
			},
		},
		mengaoan: {
			audio: 5,
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return Math.ceil(event.player.hp / 2) > 0;
			},
			prompt(event, player) {
				var num = Math.ceil(event.player.hp / 2);
				return '傲岸：失去' + num + '点体力，你进入一轮全盛姿态，然后你[重伤]并对一名角色造成1点伤害';
			},
			filterTarget: true,
			async content(event, trigger, player) {
				const target = event.targets[0];
				await player.loseHp(Math.ceil(player.hp / 2));
				await player.addhyyzBuff('hyyzBuff_zhongshang');
				await target.damage();

				player.addSkill('mengquansheng')
				player.addTip('mengquansheng', '全盛姿态')
				player.when({ player: "phaseBegin" }).then(() => {
					player.removeSkill('mengquansheng')
					player.removeTip('mengquansheng')
				})
			},
			ai: {
				order: 10,
				result: {
					player(player) {
						return player.hp > 1;
					}
				}
			},
		}, mengquansheng: {
			audio: 'mengaoan',
			mark: true,
			marktext: '盛',
			intro: {
				name: "全盛姿态",
				content: '所有技能得到加强<br>你造成伤害后回复一点体力',
			},
			trigger: {
				source: 'damageSource'
			},
			charlotte: true,
			forced: true,
			async content(event, trigger, player) {
				game.log('#g全盛姿态，' + get.translation(player) + '恢复1点体力');
				player.recover();
			},
		},
		"mengxuexing_info": "血性|锁定技，你造成伤害后，受伤角色" + get.hyyzIntroduce('重伤') + "。<br><span class=firetext>全盛姿态：" + get.hyyzIntroduce('重伤') + "的角色不能响应你使用的牌。</span>",
		"mengpijing_info": "辟径|出牌阶段限一次，若你没有护甲，你失去1点体力并获得2点护甲；否则，失去所有护甲并摸等量的牌。<br><span class=firetext>全盛姿态：此技改为出牌阶段限两次，且收益的数值+1。</span>",
		"mengaoan_info": "傲岸|出牌阶段限一次，你可以失去一半体力（向上取整），直到你的下回合开始进入全盛姿态。若如此做，你" + get.hyyzIntroduce('重伤') + "并对其他角色造成一点伤害。<br><span class=firetext>全盛姿态：你造成伤害后回复一点体力。</span>",
	},
	2310: {
		hyyz_xt_huimie_kaituozhe: ['开拓者',
			["female", "hyyz_xt", 4, ["hyyzsheming", "hyyzhuimie"], []],
			'紫灵谷的骊歌',
			'尾巴已对技能〖翥跹〗〖毁灭〗进行修改，若有其他方案可私信尾巴修改。<br>你记得不多。<br>你并非来自此地，也并非来自彼方，你本不去往任意一处——<br>直到模糊的声在你耳边吹拂，那悲伤爱怜的劝导，似是而非的催促……<br>种子扎根。你睁开双眼，那说话的人已不在。<br>只是声音愈来愈多愈清晰。<br>有无虑的关照，有镇静的劝告，有毅然的坚持，有温柔的点拨……<br>你看到锦线正织成明日。<br>巨大的兽自无垠降下，<br>金色的瞳从黑夜俯视，<br>你也不再被过去抛弃。<br>你还将开拓漫长旅途，<br>踏过的荆棘都成了路。<br>列车鸣笛，愿你抵达将至的未来<br>——以你自己的意志。'
		],
		hyyzsheming: {
			audio: 5,
			cardSuit(list) {
				if (!list) return [];
				var suits = [];
				if (list.length < 1) return [];
				for (var i of list) {
					var suit = get.suit(i);
					if (suit && !suits.includes(suit)) {
						suits.push(suit);
					}
				}
				return suits;
			},
			enable: "phaseUse",
			usable: 1,
			filterTarget: lib.filter.notMe,
			async content(event, trigger, player) {
				const targetx = event.targets[0];
				let cardx = [];
				const { cards: cards1 } = await targetx
					.chooseToDiscard(2, 'he', '弃置两张牌，否则受到' + get.translation(player) + '造成的1点伤害', '提示：尽可能选择花色相同的两张牌')
					.set('ai', function (card) {
						let target = _status.event.player;
						if (target.hp > 3 || ['jiu', 'tao'].includes(card.name)) return -1;
						if (target.hp < 2 && target.countCards('he') >= 2) return 100;
						var value = get.value(card);
						if (ui.selected.cards.length) {
							if (get.suit(ui.selected.cards[0]) == get.suit(card)) value /= 2;
						}
						return 10 - value;
					})
					.forResult();
				if (cards1) cardx.addArray(cards1)
				else if (targetx.isIn()) await targetx.damage(player);
				if (player.isIn()) {
					const { cards: cards2 } = await player
						.chooseToDiscard(2, 'he', '弃置两张牌，否则受到' + get.translation(targetx) + '造成的1点伤害', '你们弃置的牌花色不同，可以摸两张牌')
						.set('cardsx', cardx)
						.set('ai', function (card) {
							var player = _status.event.player;
							if (player.hp > 2 || ['jiu', 'tao'].includes(card.name)) return -1;
							var cardsx = _status.event.cardsx.slice();
							var suits = lib.skill.hyyzsheming.cardSuit(cardsx), suits_no = lib.suit.slice();
							suits_no.removeArray(suits);

							if (cardsx.length) {
								if (suits.length < 2) return 10 - get.value(card);
								if (!player.countCards('he', { suit: suits_no[0] }) || !player.countCards('he', { suit: suits_no[1] })) return 10 - get.value(card);//你没合适的牌
								if (ui.selected.cards.length) {
									if (!cardsx.includes(ui.selected.cards[0])) cardsx.push(ui.selected.cards[0]);
									suits = lib.skill.hyyzsheming.cardSuit(cardsx);
								}
								return !suits.includes(get.suit(card));
							} else {
								if (ui.selected.cards.length) return get.suit(ui.selected.cards[0]) != get.suit(card);
								return true;
							}
						})
						.forResult()
					if (cards2) cardx.addArray(cards2);
					else if (targetx.isAlive()) {
						await player.damage(targetx);
					};
					let suits = lib.skill.hyyzsheming.cardSuit(cardx);
					if (suits.length == 0) {
						game.log(player, '和', targetx, '均未弃置牌');
					} else {
						if (suits.length == cardx.length) await player.draw(2);
						if (cardx.length == 4 && player.getStat().skill.hyyzsheming) {
							delete player.getStat().skill.hyyzsheming;
						}
					}
				}

			},
			ai: {
				order: 8,
				expose: 0.3,
				result: {
					target(player, target) {
						if (target.hasSkillTag('noh')) return 0;
						if (target.countCards('he') < 2 || target.hp < 2) return -5;
						return -2;
					},
					player(player, target) {
						return player.hp + player.countCards('h') - 5;
					},
				},
				threaten: 1.1,
			},
		},
		hyyzhuimie: {
			audio: 3,
			trigger: {
				source: 'damageBegin2',
				player: 'damageBegin4',
			},
			usable: 1,
			filter(event, player) {
				return event.num % player.hp == 0
			},
			async content(event, trigger, player) {
				if (trigger.source == player) trigger.num++
				else if (trigger.player == player) trigger.num--
			},
		},
		hyyzsheming_info: "舍命|出牌阶段限一次，你可以令一名其他角色与你依次选择一项：①弃置两张牌；②受到对方造成的1点伤害。若弃置的牌花色各不相同，你摸两张牌；若弃置了四张牌，重置此技。",
		hyyzhuimie_info: '毁灭|每回合限一次，当你造成/受到伤害时，若伤害值为你体力值的倍数，此伤害+1/-1。',

		hyyz_xt_cunhu_kaituozhe: ['开拓者',
			["female", "hyyz_xt", 4, ["hyyzcunhu", "hyyzzhongwang"], []],
			'紫灵谷的骊歌',
			'尾巴已对技能〖存护〗〖众望〗进行修改，若有其他方案可私信尾巴修改。<br>你记得不多。<br>你并非来自此地，也并非来自彼方，你本不去往任意一处——<br>直到模糊的声在你耳边吹拂，那悲伤爱怜的劝导，似是而非的催促……<br>种子扎根。你睁开双眼，那说话的人已不在。<br>只是声音愈来愈多愈清晰。<br>有无虑的关照，有镇静的劝告，有毅然的坚持，有温柔的点拨……<br>你看到锦线正织成明日。<br>巨大的兽自无垠降下，<br>金色的瞳从黑夜俯视，<br>你也不再被过去抛弃。<br>你还将开拓漫长旅途，<br>踏过的荆棘都成了路。<br>列车鸣笛，愿你抵达将至的未来<br>——以你自己的意志。'
		],
		hyyzcunhu: {
			audio: 4,
			trigger: {
				player: ["phaseJieshuBegin"],
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget(get.prompt('hyyzcunhu'), '将装备区内的所有牌移动给一名其他角色', lib.filter.notMe)
					.set('ai', function (target) {
						var player = _status.event.player;
						if (get.attitude(player, target) > 0) {
							return 10 + target.countCards('e') + player.countCards('e') - target.hp - target.hujia;
						} else return -1;
					})
					.forResult();
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				if (player.getCards('e').length > 0) {
					let cards = player.getCards('e');
					for (let card of cards) {
						if (target.canEquip(card, false)) {
							await target.equip(card);
							await game.delay()
						}
					}
				};
				player.draw(target.countCards('e'));
				target.draw(player.countCards('e'));
			},
		},
		hyyzzhongwang: {
			audio: 2,
			logAudio(event, player, triggername, indexedData, costResult) {
				return [
					'ext:忽悠宇宙/asset/character/audio/hyyzzhongwang1.mp3',
				]
			},
			mark: true,
			intro: {
				content: "limited",
			},
			limited: true,
			skillAnimation: true,
			animationColor: 'fire',

			enable: 'phaseUse',
			filter(event, player) {
				const targets = player.getAllHistory('useSkill', evt => evt.skill == 'hyyzcunhu').map(i => i.targets[0]).unique();
				return targets.length > 0 && targets.some(i => i.countCards('eh', (card) => get.type(card) == 'equip' && player.canEquip(card, false)) > 0)
			},
			selectTarget: -1,
			filterTarget(card, player, target) {
				return player.getAllHistory('useSkill', evt => evt.skill == 'hyyzcunhu').map(i => i.targets[0]).unique().includes(target)
			},
			async content(event, trigger, player) {
				player.awakenSkill('hyyzzhongwang');
				player.storage.hyyzzhongwang = true;
				let count = 0
				const cunhu_targets = player.getAllHistory('useSkill', evt => evt.skill == 'hyyzcunhu').map(i => i.targets[0]).unique();
				for (let target of cunhu_targets) {
					let num = target.countCards('he', (card) => get.type(card) == 'equip' && player.canEquip(card, false))
					if (!num) continue;
					const { cards } = await target
						.chooseCard('众望：是否将任意装备牌置入' + get.translation(player) + '的装备区？', 'eh', [1, num])
						.set('filterCard', (card) => {
							if (!player.canEquip(card, false) || get.type(card) != 'equip') return false;
							if (ui.selected.cards.length) {
								return ui.selected.cards.every(i => get.subtype(card) != get.subtype(i));
							} else {
								return true
							}
						})
						.set('complexCard', true)
						.set('ai', (card) => true)
						.forResult()
					if (cards) {
						count++;
						for (let card of cards) {
							if (player.canEquip(card)) {
								target.line(player, 'green')
								await player.equip(card);
							}
						}
					}
				}
				if (count > 0) {
					const { targets } = await player.chooseTarget('对一名其他角色造成' + count + '点火焰伤害', lib.filter.notMe)
						.set('ai', function (target) {
							let player = _status.event.player;
							return get.damageEffect(target, player, player, 'fire') * count;
						})
						.forResult();
					if (targets) {
						game.hyyzSkillAudio('hyyzzhongwang', 2)
						player.line(targets, 'fire');
						await targets[0].damage('fire');
					}
				}
			},
			ai: {
				order: 10,
				result: {
					player(card, player, target) {
						const targets = player.getAllHistory('useSkill', evt => evt.skill == 'hyyzcunhu').map(i => i.targets[0]).unique();
						return targets.length;
					}
				}
			},
		},
		hyyzcunhu_info: '存护|结束阶段，你可以选择一名其他角色并将装备区内的牌移给该角色的空装备栏，然后摸对方装备区内牌数张牌。',
		hyyzzhongwang_info: "众望|限定技，出牌阶段，你可依次令成为过〖存护〗目标的角色选择将任意装备牌置入你的空装备栏，然后造成X点火焰伤害（X为响应的角色数）。",

		hyyz_xt_tongxie_kaituozhe: ['开拓者',
			["female", "hyyz_xt", 4, ["hyyzzhulian", "hyyztongxie"], []],
			'紫灵谷的骊歌',
			'尾巴已对技能〖翥跹〗进行修改，并新增技能〖同谐〗，若有其他方案可私信尾巴修改。<br>你记得不多。<br>你并非来自此地，也并非来自彼方，你本不去往任意一处——<br>直到模糊的声在你耳边吹拂，那悲伤爱怜的劝导，似是而非的催促……<br>种子扎根。你睁开双眼，那说话的人已不在。<br>只是声音愈来愈多愈清晰。<br>有无虑的关照，有镇静的劝告，有毅然的坚持，有温柔的点拨……<br>你看到锦线正织成明日。<br>巨大的兽自无垠降下，<br>金色的瞳从黑夜俯视，<br>你也不再被过去抛弃。<br>你还将开拓漫长旅途，<br>踏过的荆棘都成了路。<br>列车鸣笛，愿你抵达将至的未来<br>——以你自己的意志。'
		],
		hyyzzhulian: {
			audio: 5,
			pathSkill: true,
			enable: 'phaseUse',
			usable: 2,
			filter(event, player) {
				return player.countCards('he') > 0;
			},
			filterCard: true,
			check: (card) => 8 - get.value(card),
			position: 'he',
			discard: false,
			lose: false,
			filterTarget: lib.filter.notMe,
			selectTarget: [0, 1],
			prompt(event, player) {
				return '选择一张牌，默认置于牌堆顶，或选择并置于其他角色区域内';
			},
			async content(event, trigger, player) {
				const card = event.cards[0];
				if (event.targets?.length > 0) {
					const target = event.targets[0];
					let pisotions = ['手牌区'];
					if (get.type(card) == 'equip' && target.canEquip(card, true)) pisotions.push('装备区');
					if (get.type(card) == 'delay' && target.canAddJudge(get.name(card))) pisotions.push('判定区');
					const { control } = pisotions.length > 1 ? await player
						.chooseControl(pisotions)
						.set('prompt', '将' + get.translation(card) + '置于' + get.translation(target) + '的哪个区域？')
						.set('ai', () => '手牌区')
						.forResult() : { control: pisotions[0] }
					if (control) {
						switch (control) {
							case '手牌区': await player.give(card, target); break;
							case '装备区': await target.equip(card); break;
							case '判定区': await target.addJudge(lib.card[card.name].type == 'delay' ? card : get.autoViewAs({ name: get.name(card) }, [card]), [card]); break;
						}
						await player.gain(get.cards(), 'draw')
					}
				} else {
					await player.lose(card, ui.cardPile, 'insert');
					player.$throw(card, 1000);
					game.log(player, '将一张牌置于牌堆顶');
					const players = game.filterPlayer(i => i != player && i.countGainableCards(player, 'hej') > 0)
					if (players.length) {
						const { targets } = players.length > 1 ? await player
							.chooseTarget('获得一名角色区域内的一张牌', true, (card, player, target) => target != player && target.countGainableCards(player, 'hej') > 0)
							.forResult() : { targets: players }
						if (targets) {
							await player.gainPlayerCard(targets[0], 'hej', true);
						}
					}
				}
			},
			ai: {
				order: 10,
				result: {
					target: 2,
					player: 1
				}
			}
		},
		hyyztongxie: {
			trigger: {
				global: 'gainAfter'
			},
			filter(event, player) {
				if (event.player == player) {//你获得
					return game.hasPlayer(c => c != player && event.getl(c)?.cards2.some(j => event.getg(player).includes(j)));
				} else {
					return event.getl(player)?.cards2.some(j => event.getg(event.player).includes(j))
				}
			},
			async cost(event, trigger, player) {
				const targets = [trigger.player];
				const cards = trigger.getg(trigger.player)
				game.filterPlayer(c => {
					if (trigger.getl(c)?.cards2.some(j => cards.includes(j))) {
						targets.add(c)
					}
				})
				event.result = await player
					.chooseTarget(get.prompt2('hyyztongxie'), (card, player, target) => {
						return targets.includes(target)
					})
					.set('ai', (target) => get.attitude2(target))
					.forResult()
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				const { color } = await target
					.judge(function (card) {
						if (target.hp == target.maxHp) {
							if (get.color(card) == "red") return -1;
						}
						if (get.color(card) == "red") return 1;
						return 0;
					})
					.forResult();
				switch (color) {
					case "red": if (target.hp < target.maxHp) await target.recover(); break;
					case "black": target.draw(); break;
					default: break;
				}
			},
			mod: {
				playerEnabled(card, player, target) {
					if (_status.event.getParent().name == 'hyyztongxie' && target.hasHistory('gain')) return false
				}
			},
		},
		hyyzzhulian_info: "翥跹|出牌阶段限两次，你可以选择一张牌和一名其他角色，你将此牌置于其中一项并获得另一项一张牌：①牌堆顶②该角色的区域内。",
		hyyztongxie_info: '同谐|你获得其他角色的牌后，或其他角色获得你的牌后，你可令一方进行〖恢拓〗判定。',

		hyyz_xt_sp_kafuka: ['卡芙卡', ["female", "hyyz_xt", 3, ["mengyuemian", "mengyexuan"], []], '柚衣'],
		mengyuemian: {
			audio: 2,
			trigger: {
				player: "linkBegin",
				global: 'damageEnd'
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'link') return !player.isLinked();
				else return event.dotDebuff == 'hyyzBuff_chudian';
			},
			async content(event, trigger, player) {
				if (trigger.name == 'link') trigger.cancel();
				else {
					player.chooseDrawRecover(true);
				}
			},
		},
		mengyexuan: {
			audio: 4,
			logAudio: (index) => [
				`ext:忽悠宇宙/asset/character/audio/hyyzmosuo1.mp3`,
				`ext:忽悠宇宙/asset/character/audio/hyyzmosuo2.mp3`
			],
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return player.countCards('he');
			},
			filterCard: true,
			selectCard() {
				return [1, Math.min(3, game.countPlayer((current) => current != _status.event.player))]
			},
			position: "he",
			filterTarget: lib.filter.notMe,
			selectTarget: () => (ui.selected.cards.length),
			prompt: '夜喧，选择判定的角色',
			targetprompt(target) {
				return get.translation(get.color(ui.selected.cards[ui.selected.targets.indexOf(target)]));
			},
			discard: false,
			delay: false,
			loseTo: "cardPile",
			insert: true,
			visible: false,
			check(card) {
				if (get.color(card) == 'red') return _status.event.player.hp > 3;
				else return 8 - get.value(card);
			},
			async content(event, trigger, player) {
				const user = event.target;
				const { color } = await user
					.judge('mengyexuan', (card) => get.color(card) == 'red' ? 1 : 1.5)
					.forResult();
				if (color == 'black') {
					game.hyyzSkillAudio('mengyexuan', 3)
					await user.addhyyzBuff('hyyzBuff_chudian');
					await user.hyyzBang()
				} else {
					game.hyyzSkillAudio('mengyexuan', 4)
					const cards = user.countCards('h') ? (await player.choosePlayerCard(user, true, 'h', 'visible')
						.set('prompt', '夜喧：选择一张牌')
						.set('prompt2', '令其对你指定的角色使用此牌，或你获得此牌，其视为对你指定的角色使用【杀】')
						.set('user', user)
						.set('ai', button => {
							var player = _status.event.player, user = _status.event.user;
							var card = button.link;
							var eff = 0, att = -1;
							game.countPlayer(function (current) {
								if (current != user && user.canUse(button.link, current)) {
									eff = get.effect(current, card, user, player);
									att = (get.attitude(player, current) + get.attitude(player, user)) / 1.5;
								}
							});
							if (eff * att > 0) return eff * att;
							else return get.value(card);
						})
						.forResult()).cards : [];
					if (cards?.length > 0) {
						let cardx;
						if (!user.hasUseTarget(cards[0])) {
							await user.give(cards, player, 'giveAuto');
							cardx = { name: 'sha', isCard: true }
						} else {
							cardx = cards[0];
						};
						if (cardx && user.hasUseTarget(cardx)) {
							const { targets } = await player
								.chooseTarget(true, (card, player, target) => user.canUse(cardx, target))
								.set('prompt', `夜喧：选择${get.translation(user)}使用${get.translation(cardx)}的目标`)
								.set('ai', (target) => get.effect(target, cardx, user, player))
								.forResult();
							if (targets) {
								await user.useCard(cardx, targets)
							}
						}
					}
				}
			},
			ai: {
				order: 10,
				result: {
					target(player, target) {
						if (get.attitude(player, target) > 0) return;
						var eff = get.damageEffect(target, player, player, 'thunder');
						if (target.hashyyzBuff('hyyzBuff_chudian')) eff *= 2;
						return eff * get.attitude(player, target);
					},
				},
			},
		},
		"mengyuemian_info": "月绵|锁定技，你不能被横置。当有角色受到" + get.hyyzIntroduce('触电') + "伤害后，你摸一张牌或回复1点体力。",
		"mengyexuan_info": "夜喧|出牌阶段限一次，你可以将至多三张牌置于牌堆顶，然后令等量的其他角色依次进行判定，若结果为：<br>1.红色，你观看并选择其的一张手牌，然后指定另一名角色。若其可以对指定的角色使用此牌，其使用之；否则，你获得此牌并视为其对你指定的角色使用【杀】。<br>2.黑色，令该角色" + get.hyyzIntroduce('触电') + "，然后引爆其的所有dot效果。",

		hyyz_ys_nuoaier: ['诺艾尔', ["female", "hyyz_ys", 3, ["mengchawei", "mengkuangzhu", "mengjianshou"], []], '日玖阳气冲三关', '尾巴已对技能〖匡助〗〖缄守〗进行修改，若有其他方案可私信尾巴修改。'],
		mengchawei: {
			audio: 4,
			trigger: {
				player: ["phaseZhunbeiBegin", "damageEnd"],
			},
			async cost(event, trigger, player) {
				const result = await player.chooseTarget('察微：观看一名角色的手牌', '令其摸一张牌，或弃置其一张牌')
					.set('ai', function (target) {
						var att = get.attitude(_status.event.player, target);
						if (att > 0) {
							if (target.hasSkillTag('nogain')) {
								return false;
							} else {
								if (target == player) return att;
								else return att * 2;
							}
						} else {
							return -att * (target.countCards('e') + 1);
						}
					})
					.forResult();
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				let cards = undefined;
				const target = event.targets[0];
				if (target.countCards('he')) {
					cards = (await player
						.discardPlayerCard('弃置' + get.translation(target) + '的一张牌，或点取消令其摸一张牌', target, 'he', 'visible')
						.set('ai', button => {
							var att = _status.event.att, target = _status.event.targetx;
							var card = button.link;
							var val = target.getUseValue(card);
							if (att <= 0) {
								if (val > 0) return val;
								return get.value(card);
							}
							return -100;
						})
						.set('att', get.attitude(player, target))
						.set('targetx', target)
						.forResult()).cards;
				}
				if (!cards) {
					await target.draw();
				}
			},
		},
		mengkuangzhu: {
			audio: 7,
			global: 'mengkuangzhu2',
		},
		mengkuangzhu2: {
			enable: ["chooseToUse", "chooseToRespond"],
			hiddenCard(player, name) {
				if (!game.hasPlayer(i => i != player && i.hasSkill('mengkuangzhu'))) return false;
				return get.type({ name: name }) == 'basic'
			},
			filter(event, player) {
				if (event.mengkuangzhu2) return false;
				if (!game.hasPlayer(i => i != player && i.hasSkill('mengkuangzhu'))) return false;
				if (player.hasHistory('useCard', evt => evt.card.storage?.mengkuangzhu)) return false;
				for (var name of lib.inpile) {
					var type = get.type(name);
					if (type == 'basic' && event.filterCard({ name: name }, player, event)) return true;
					if (name == 'sha') {
						for (var nature of lib.inpile_nature) {
							if (event.filterCard({ name: name, nature: nature }, player, event)) return true;
						}
					}
				}
				return false;
			},
			chooseButton: {
				dialog(event, player) {
					let dialog = ui.create.dialog('匡助', 'hidden');
					let list = [];
					for (const name of lib.inpile) {
						let card = { name: name, isCard: true };
						if (!event.filterCard(card, player, event)) continue;
						const type = get.type(name);
						if (type == 'basic') list.add([type, '', name]);
						if (name == 'sha') {
							for (let nature of lib.inpile_nature) {
								card.nature = nature;
								if (!event.filterCard(card, player, event)) continue;
								list.add(['基本', '', 'sha', nature]);
							}
						}
					}
					dialog.add([list, 'vcard']);
					return dialog;
				},
				filter(button, player) {
					var evt = _status.event.getParent();
					return evt.filterCard({
						name: button.link[2],
						nature: button.link[3]
					}, player, evt);
				},
				check(button) {
					return _status.event.player.getUseValue({
						name: button.link[2],
						nature: button.link[3],
						isCard: true,
					});
				},
				backup(links, player) {
					return {
						audio: 'mengkuangzhu',
						viewAs: {
							name: links[0][2],
							nature: links[0][3],
							suit: 'none',
							number: null,
							storage: {
								mengkuangzhu: true,
							},
							isCard: true,
						},
						filterCard: () => false,
						selectCard: -1,
						popname: true,
						async precontent(event, trigger, player) {
							const name = event.result.card.name;
							let players = game.filterPlayer(current => current != player && current.hasSkill('mengkuangzhu'));
							let bool = false;
							if (players.length) {
								for (let current of players) {
									const { bool: boolx } = await current
										.chooseBool('是否受到1点伤害，视为' + get.translation(player) + '使用' + get.translation(name) + '？')
										.set('ai', () => _status.event.att > 0)
										.forResult();
									if (boolx) {
										current.say(['不要怕，我来帮忙啦', '好痛……', '我没关系的'].randomGet());
										bool = true;
										await current.damage('nocard', 'nosource');
										const { control } = await player
											.chooseControl('必须回报诺艾尔小姐！', '残忍拒绝！')
											.set('prompt', '可爱的诺艾尔小姐舍身帮助了你，不打算让她摸一张牌么？')
											.set('ai', () => get.attitude(player, current) >= 0 ? '必须回报诺艾尔小姐！' : '残忍拒绝！')
											.forResult();
										if (control == '必须回报诺艾尔小姐！') {
											await current.draw();
										}
										break;
									}
								}
							}
							if (bool) {
								event.result.card = {
									name: name,
									isCard: true,
								};
								event.result.cards = [];
								delete event.result.skill;
							} else {
								var evt = event.getParent();
								evt.set("mengkuangzhu2", true);
								evt.goto(0);
								return;
							}
						},
					}
				},
				prompt(links, player) {
					return '匡助：请诺艾尔受到1点伤害，以令你使用并选择' + get.translation(links[0][2]) + '的目标';
				},
			},
			ai: {
				save: true,
				respondSha: true,
				respondShan: true,
				skillTagFilter(player, tag, arg) {
					let list = [];
					game.filterPlayer(current => {
						if (current.getStorage('mengyouwen2').length) list.addArray(current.getStorage('mengyouwen2'));
					});
					if (!list.length || player.hasSkill('mengbolun3')) return false;
					if (tag == "respondSha" || tag == "respondShan") {
						if (arg == "respond") return false;
						return list.includes(tag == "respondSha" ? "sha" : "shan")
					}
					return list.includes("tao") || (list.includes("jiu") && arg == player);
				},
				order: 4,
				result: {
					player: 1,
				},
				threaten: 1.9,
			},
		},
		mengjianshou: {
			audio: 4,
			trigger: {
				player: 'gainAfter',
				global: 'loseAsyncAfter'
			},
			usable: 1,
			forced: true,
			filter(event, player) {
				return player.hujia < 1 && event.getg(player).length;
			},
			async content(event, trigger, player) {
				player.changeHujia(1);
			},
			mod: {
				targetEnabled(card, player, target, now) {
					if (card.name == 'shunshou' && player.hasSkill('mengjianshou')) return false;
				},
				playerEnabled(card, player, target) {
					if (card.cards && card.cards.some(a => a.hasGaintag('mengjianshou')) && player != target) return false;
				},
			},
			group: 'mengjianshou_gain',
			subSkill: {
				gain: {
					silent: true,
					trigger: {
						player: ['gainAfter'],
						global: 'loseAsyncAfter'
					},
					filter(event, player) {
						return player != _status.currentPhase && event.getg(player).length;
					},
					async content(event, trigger, player) {
						player.addGaintag(trigger.getg(player), "mengjianshou");
					},
				}
			}
		},
		"mengchawei_info": "察微|准备阶段或你受到伤害后，你可以观看一名角色的手牌，然后你弃置其中一张牌，或令其摸一张牌。",
		"mengkuangzhu_info": "匡助|每回合限一次，当一名其他角色需要使用或打出一张基本牌时，你可以受到1点伤害并视为其使用或打出此牌。若如此做，其可以令你摸一张牌。",
		mengkuangzhu2_info: '匡助|',
		"mengjianshou_info": "缄守|锁定技，你不能成为【顺手牵羊】的目标；你不能对其他角色使用回合外获得的牌；每回合首次获得牌后，将护甲补充至1。",

		hyyz_ys_qingqizhe: ['倾奇者', ["male", "hyyz_ys", 3, ["mengsanpan", "mengnixin", "menggulu"], []], '柚衣'],
		mengsanpan: {
			audio: 4,
			logAudio: () => false,
			mark: true,
			marktext: "叛",
			intro: {
				content(storage, player, skill) {
					let str = '<li>上一轮于回合外';
					if (player.storage.mengsanpan_log[1][0]) str += '<p style=\"color:rgb(124,252,0)\">体力值减少过</p>';
					else str += '<p style="color:rgb(255,102,102)">体力值未减少</p>';
					if (player.storage.mengsanpan_log[1][1]) str += '<p style=\"color:rgb(124,252,0)\">失去过牌</p>';
					else str += '<p style=\"color:rgb(255,102,102)\">未失去过牌</p>';
					str += '<li>当前'
					if (player.countCards('j') > 0) str += '<p style=\"color:rgb(124,252,0)\">判定区有牌</p>';
					else str += '<p style=\"color:rgb(255,102,102)\">判定区没有牌</p>';

					str += '<li>本轮于回合外';
					if (player.storage.mengsanpan_log[0][0]) str += '<p style=\"color:rgb(124,252,0)\">体力值减少过</p>';
					else str += '<p style=\"color:rgb(255,102,102)\">体力值未减少</p>';
					if (player.storage.mengsanpan_log[0][1]) str += '<p style=\"color:rgb(124,252,0)\">失去过牌</p>';
					else str += '<p style=\"color:rgb(255,102,102)\">未失去过牌</p>';
					return str;
				},
			},
			trigger: {
				player: "phaseBegin",
			},
			forced: true,
			async content(event, trigger, player) {
				let num = 0;
				if (player.storage.mengsanpan_log && player.storage.mengsanpan_log[1][0]) {
					game.log('#g【三叛】1', '上轮于回合外体力值减少')
					num++;
					player.storage.mengsanpan_log[1][0] = false;
				}
				if (player.storage.mengsanpan_log && player.storage.mengsanpan_log[1][1]) {
					game.log('#g【三叛】1', '上轮于回合外失去过牌')
					num++;
					player.storage.mengsanpan_log[1][1] = false;
				}
				if (player.countCards('j') > 0) {
					game.log('#g【三叛】', '判定区有牌')
					num++;
				}

				if (num > 0) {
					while (num && game.hasPlayer(current => current != player && current.countCards('hej') > 0)) {
						num--;
						const { targets } = await player
							.chooseTarget(true, '三叛：获得一名其他角色区域内的一张牌（剩余' + num + '次）', function (card, player, current) {
								return current != player && current.countCards('hej') > 0
							})
							.set('ai', function (target) {
								var player = _status.event.player;
								return get.effect(target, { name: 'shunshou' }, player, player);
							})
							.forResult();
						if (targets) {
							game.hyyzSkillAudio('mengsanpan', 1, 2)
							await player.gainPlayerCard(targets[0], 'hej', true);
						} else return;
					}
				} else if (player.countCards('he')) {
					const { cards, targets } = await player
						.chooseCardTarget({
							prompt: '三叛：是否弃置一张牌，令一名角色回复1点体力或摸两张牌',
							filterCard: true,
							position: 'he',
							filterTarget: true,
							ai1(card) {
								return 8 - get.value(card);
							},
							ai2(target) {
								return get.attitude(_status.event.player, target);
							}
						})
						.forResult();
					if (cards && targets) {
						game.hyyzSkillAudio('mengsanpan', 3, 4)
						await player.discard(cards);
						await targets[0].chooseDrawRecover('三叛：回复1点体力或摸两张牌', 2, true);
					}
				}
			},
			group: ["mengsanpan_hp", "mengsanpan_lose", "mengsanpan_log"],
			subSkill: {
				log: {
					silent: true,
					charlotte: true,
					init(player) {
						player.storage.mengsanpan_log = [[false, false], [false, false]];
					},
					trigger: {
						global: "roundStart",
					},
					async content(event, trigger, player) {
						game.log('#g【三叛】1', '截止上轮记录')
						player.storage.mengsanpan_log[1] = player.storage.mengsanpan_log[0];
						game.log('#g【三叛】0', '记录刷新')
						player.storage.mengsanpan_log[0] = [false, false];
					},
				},
				hp: {
					silent: true,
					charlotte: true,
					trigger: {
						player: ["damageEnd", "loseHp"],
					},
					filter(event, player) {
						return player.storage.mengsanpan_log[0][0] == false && player != _status.currentPhase;
					},
					async content(event, trigger, player) {
						game.log('#g【三叛】0', '记录回合外体力减少');
						player.storage.mengsanpan_log[0][0] = true;
					},
				},
				lose: {
					silent: true,
					charlotte: true,
					trigger: {
						player: "loseAfter",
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					filter(event, player) {
						if (player == _status.currentPhase) return false;
						if (event.name == 'gain' && event.player == player) return false;
						var evt = event.getl(player);
						return evt && evt.cards2 && evt.cards2.length > 0 && player.storage.mengsanpan_log[0][1] == false;
					},
					async content(event, trigger, player) {
						game.log('#g【三叛】0', '记录回合外失去牌')
						player.storage.mengsanpan_log[0][1] = true;
					},
				},
			},
			"_priority": 0,
		},
		mengnixin: {
			audio: 3,
			logAudio: () => false,
			trigger: {
				global: "damageBegin4",
				player: "phaseDiscardBegin",
			},
			filter(event, player) {
				if (event.name == 'phaseDiscard') return true;
				if (!event.source || event.source == event.player) return false;
				if (event.player == player && _status.currentPhase != event.source) return true;
				if (event.source == player && _status.currentPhase != player) return true;
			},
			forced: true,
			async content(event, trigger, player) {
				if (trigger.name == 'phaseDiscard') {
					game.hyyzSkillAudio('mengnixin', 1)
				} else {
					if (trigger.player == player) {
						game.hyyzSkillAudio('mengnixin', 3)
					} else {
						game.hyyzSkillAudio('mengnixin', 2)
					}
					trigger.cancel();
				}
			},
			mod: {
				maxHandcard(player, num) {
					return num + 1;
				},
			},
			"_priority": 0,
		},
		menggulu: {
			audio: 2,
			trigger: {
				player: "gainAfter",
			},
			filter(event, player) {
				if (!event.source || event.source == player || !event.source.isIn()) return false;
				if (_status.currentPhase != player) return false;
				return player.countCards('he', function (card) { return get.type(card) == 'equip' }) > 0 || event.source.countCards('e') > 0;
			},
			frequent: 'check',
			check(event, player) {
				if (get.attitude(event.player, event.source) < 0) return true;
			},
			async cost(event, trigger, player) {
				const targets = [];
				if (player.countCards('he', { type: 'equip' }) > 0) targets.add(player);
				if (trigger.source != player && trigger.source.countCards('e') > 0) targets.add(trigger.source);
				if (targets.length > 0) {
					event.result = await player
						.chooseTarget('孤履：选择对方或自己', lib.translate['menggulu_info'], function (card, player, target) {
							return _status.event.targetx.includes(target);
						})
						.set('targetx', targets)
						.set('ai', function (target) {
							var sourcex = _status.event.sourcex;
							var att = get.attitude(player, sourcex);
							if (att < 0) return player.countCards('he', { type: 'equip' });
						})
						.set('sourcex', trigger.source)
						.forResult();
				}
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				if (target == player) {
					const { cards } = await player.chooseCard(true, 'he', { type: 'equip' }).forResult()
					if (cards) {
						await player.discard(cards);
						await trigger.source.damage('thunder');
						if (get.subtype(cards[0]) == 'equip1') await player.recover()
					}
				} else {
					const { cards } = await player.choosePlayerCard(true, target, 'e').forResult()
					await target.recast(cards);
					if (get.subtype(cards[0]) == 'equip1') await target.draw();
				}
			},
		},
		"mengsanpan_info": "三叛|锁定技，回合开始时，你每满足一项，可以获得其他角色区域内的一张牌：<br>1.上一轮你于回合外体力值减少过。<br>2.上一轮你于回合外失去过牌。<br>3.你的判定区有牌。<br>若均不满足，你可以弃置一张牌，令一名角色回复1点体力或摸两张牌。",
		"mengnixin_info": "匿心|锁定技，你的手牌上限+1。你于回合外对其他角色造成伤害时，或其他角色于其回合外对你造成伤害时，防止之。",
		"menggulu_info": "孤履|当你于回合内获得其他角色的牌后，你可以选择一项：<br>1.重铸其装备区内的一张牌。若此牌为武器牌，则其额外摸一张牌。<br>2.你弃置一张装备牌并对其造成1点雷电伤害。若此牌为武器牌，则你回复1点体力。",

		hyyz_xt_yanqing: ['彦卿', ["male", "hyyz_xt", 4, ['mengjiaoqi', 'mengduanao'], []], '绯色愫'],
		mengjiaoqi: {
			audio: 4,
			logAudio: () => [
				'ext:忽悠宇宙/asset/character/audio/mengjiaoqi1.mp3',
				'ext:忽悠宇宙/asset/character/audio/mengjiaoqi2.mp3',
			],
			trigger: {
				player: "phaseDrawAfter",
			},
			filter(event, player) {
				return player.countCards('h') && game.countPlayer(function (current) {
					return lib.filter.targetEnabled({ name: 'sha' }, player, current);
				});
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseCardTarget({
						prompt: '选择普通【杀】的目标',
						prompt2: '将任意手牌当无距离限制的【杀】使用',
						position: 'h',
						filterCard: true,
						selectCard: [1, player.countCards('h')],
						filterTarget(card, player, target) {
							return lib.filter.targetEnabled({ name: 'sha' }, player, target);
						},
						ai1(card) {
							return 4 - get.value(card);
						},
						ai2(target) {
							return get.effect(target, { name: 'sha' }, player);
						},
					})
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				player.useCard({
					name: 'sha',
					storage: {
						mengjiaoqi: true
					},
				}, event.cards, event.targets, false);
			},
			group: 'mengjiaoqi_damage',
			subSkill: {
				damage: {
					audio: 'mengjiaoqi',
					logAudio: () => [
						'ext:忽悠宇宙/asset/character/audio/mengjiaoqi3.mp3',
						'ext:忽悠宇宙/asset/character/audio/mengjiaoqi4.mp3',
					],
					trigger: {
						source: 'damageSource'
					},
					filter(event, player) {
						return event.card && event.card.storage && event.card.storage.mengjiaoqi && !player.isMaxHandcard(true)
					},
					forced: true,
					async content(event, trigger, player) {
						var num = player.countCards('h');
						game.filterPlayer((current) => {
							var hs = current.countCards('h');
							if (hs > num) num = hs;
						});
						num++;
						await player[player.storage.mengduanao ? 'recover' : 'loseHp']()
						if (player.storage.mengduanao) {
							player.storage.mengduanao = false
							player.removeTip('mengduanao')
						}
						await player.drawTo(num)
					}
				},
			}
		},
		mengduanao: {
			audio: 2,
			trigger: {
				global: 'damageEnd',
			},
			round: 1,
			filter(event, player) {
				if (event.source == player) {
					return event.player.isAlive()
				} else {
					return event.source?.isAlive()
				}
			},
			async cost(event, trigger, player) {
				const target = trigger.source == player ? trigger.player : trigger.source
				event.result = {
					bool: true,
					cost_data: target
				}
			},
			async content(event, trigger, player) {
				await player.draw();
				const target = event.cost_data
				if (player.canCompare(target)) {
					const { bool } = await player
						.chooseToCompare(target)
						.forResult();
					if (bool) {
						await target.addhyyzBuff('hyyzBuff_dongjie');
					} else {
						var list = [];
						player.getCards('h').forEach(card => list.add(get.suit(card)));

						const { control } = await player
							.chooseControl(list, 'cancel2')
							.set('prompt', '弃置一种花色的所有手牌，下次发动〖骄麒〗时的“失去”改为“回复”。')
							.set('ai', function () {
								var player = _status.event.player;
								if (player.hasSkill('mengduanao_add')) return 'cancel2';
								var val = {}, min = ['', 100];
								for (var i of player.getCards('h')) {
									var suit = get.suit(i);
									if (!val[suit]) {
										val[suit] = get.value(i);
									} else {
										val[suit] += get.value(i);
									}
									if (val[suit] < min[1]) min = [suit, val[suit]];
								}
								return min[0];
							})
							.forResult();
						if (control != 'cancel2') {
							await player.discard(player.getCards('h', { suit: control }));
							player.storage.mengduanao = true;
							player.addTip('mengduanao', '<span class="greentext">改为回复</span>')
						}
					}
				}
			},
		},
		mengjiaoqi_info: "骄麒|摸牌阶段结束时，你可以将任意手牌当无距离限制的【杀】使用。此【杀】造成伤害后，你失去1点体力并将手牌摸至唯一最多。",
		mengduanao_info: "断傲|每轮限一次，一名角色/你造成伤害后，你可以摸一张牌并与该角色/受伤角色拼点。若你赢，其" + get.hyyzIntroduce('冻结') + "；若你没赢，你可以弃置一种花色的所有牌，下次发动〖骄麒〗时的“失去”改为“回复”。",

		hyyz_b3_chiyuan: ['赤鸢', ["female", "hyyz_b3", 3, ["mengshuyun", "mengcaixin"], []], '微雨', '尾巴已对技能〖疏云〗进行修改，若有其他方案可私信尾巴修改。'],
		mengshuyun: {
			audio: 'hyyzfusheng',
			trigger: {
				global: "damageBegin4",
			},
			check(event, player) {
				return get.attitude(player, event.player) > 0;
			},
			frequent: true,
			filter(event, player) {
				return event.source?.isIn()
			},
			logTarget: "player",
			async content(event, trigger, player) {
				const { color, suit } = await trigger.player.judge().forResult();
				if (suit && player.countCards('he', { suit: suit }) > 0) {
					if (color == 'red') {
						const { cards } = await player
							.chooseToDiscard('he', { suit: suit })
							.set('prompt', '防止此伤害且对' + get.translation(trigger.source) + '造成伤害')
							.set('ai', function (card) {
								return get.attitude(player, trigger.player) * (8 - get.value(card))
							})
							.forResult()
						if (cards) {
							trigger.cancel();
							await trigger.source.damage(trigger.player);
						}
					} else {
						let str = '此伤害改为1'
						if (trigger.source?.countGainableCards(trigger.player, 'he') > 0) {
							str += '，且' + get.translation(trigger.player) + '获得' + get.translation(trigger.source) + '一张牌'
						}
						const { cards } = await player
							.chooseToDiscard('he', { suit: suit })
							.set('prompt', str)
							.set('ai', function (card) {
								if (get.attitude(player, trigger.player)) return 8 - get.value(card)
							})
							.forResult()
						if (cards) {
							trigger.num = 1
							await trigger.player.gainPlayerCard(trigger.source, 'he');
						}
					}

				}
			},
		},
		mengcaixin: {
			audio: 'hyyzfusheng',
			group: ["mengcaixin_cancel", "mengcaixin_use", "mengcaixin_exc"],
			subSkill: {
				cancel: {
					audio: 'mengcaixin',
					trigger: {
						global: ["damageCancelled", "damageZero", "damageAfter"],
					},
					forced: true,
					filter(event, player, name) {
						if (name == 'damageCancelled') return true;
						for (var i of event.change_history) {
							if (i < 0) return true;
						}
						return false;
					},
					async content(event, trigger, player) {
						player.gainMaxHp();
					},
				},
				use: {
					audio: 'mengcaixin',
					trigger: {
						player: "useCardAfter",
					},
					filter(event, player) {
						return player.maxHp > 1 && (event.card.name == 'sha' || event.card.name == 'jiu');
					},
					"prompt2"(event, player) {
						return "减1点体力上限令" + get.translation(event.card) + "不计入次数限制"
					},
					check(event, player) {
						if (event.card.name == 'sha' && player.countCards('h', { name: 'sha' }) > 0 && player.getDamagedHp() > 2) return true;
					},
					async content(event, trigger, player) {
						await player.loseMaxHp();
						if (player.getStat().card[trigger.card.name] > 0) player.getStat().card[trigger.card.name]--;
					},
				},
				exc: {
					audio: 'mengcaixin',
					"prompt2"(event, player) {
						return "减1点体力上限令" + get.translation(event.card) + "无效，并获得" + get.translation(event.player) + "一张牌";
					},
					trigger: {
						global: ["useCard"],
					},
					logTarget: "player",
					filter(event, player) {
						if (event.player == player) return false;
						return _status.currentPhase == player && event.player.maxHp > 1;
					},
					check(event, player) {
						return player.getDamagedHp() > 2;
					},
					async content(event, trigger, player) {
						await player.loseMaxHp();
						trigger.all_excluded = true;
						trigger.targets.length = 0;
						game.log('#g【裁心】', trigger.card, '被取消');
						player.gainPlayerCard(trigger.player, 'he');
					},
				},
			},
		},
		mengshuyun_info: "疏云|一名角色受到其他角色造成的伤害时，你可以令其判定，然后可弃置一张与判定结果花色相同的牌。若此牌为：<br>①红色：防止此伤害且对伤害来源造成伤害。<br>②黑色：此伤害改为1且其获得伤害来源一张牌。",
		mengcaixin_info: "裁心|当有伤害被防止时，或伤害值发生过减少的伤害事件结算结束后，你加一点体力上限。<br>你使用【酒】或【杀】后，若你的体力上限大于1，你可以减一点体力上限令此牌不计入次数限制。<br>当其他角色于你的回合使用牌时，你可以减一点体力上限，令此牌取消之并获得其一张牌。",

		hyyz_b3_shuoyeguanxing: ['朔夜观星', ["female", "hyyz_b3", 3, ["mengtianfu", "mengdizai", "mengfengyang"], []], '沧海依酥'],
		mengtianfu: {
			audio: 2,
			marktext: '星',
			intro: {
				name: '天覆',
				name2: '星',
				content: '你有#枚“星”'
			},
			trigger: {
				player: "phaseZhunbeiBegin",
			},
			forced: true,
			filter(event, player) {
				return player.countMark('mengtianfu') > 0;
			},
			preHidden: true,
			async content(event, trigger, player) {
				const hs = player.getCards('h'), num = player.countMark('mengtianfu');

				player.removeMark('mengtianfu', 5);
				player.unmarkSkill('mengtianfu');

				const cards = get.cards(num);
				game.cardsGotoOrdering(cards);

				const next = player.chooseToMove(true);
				next.set('list', [
					['牌堆顶', cards],
					['牌堆底'],
					['你的手牌', player.getCards('h')],
				]);
				next.set('prompt', '天覆：交换等量手牌，并将牌移动到牌堆顶或牌堆底');
				next.set('num', player.countCards('h'));
				next.set('filterMove', function (from, to, moved) {
					if ((to == 0 || to == 1) && moved[2].includes(from.link)) return false;
					else return to != 2;
				});
				next.set('filterOk', function (moved) {
					return moved[2].length == _status.event.num;
				});
				next.processAI = function (list) {
					var cards = list[0][1], player = _status.event.player;
					var top = [];
					var judges = player.getCards('j');
					var stopped = false;
					if (!player.hasWuxie()) {
						for (var i = 0; i < judges.length; i++) {
							var judge = get.judge(judges[i]);
							cards.sort(function (a, b) {
								return judge(b) - judge(a);
							});
							if (judge(cards[0]) < 0) {
								stopped = true; break;
							}
							else {
								top.unshift(cards.shift());
							}
						}
					}
					var bottom;
					if (!stopped) {
						cards.sort(function (a, b) {
							return get.value(b, player) - get.value(a, player);
						});
						while (cards.length) {
							if (get.value(cards[0], player) <= 5) break;
							top.unshift(cards.shift());
						}
					}
					bottom = cards;
					return [top, bottom, player.getCards('h')];
				};
				const { moved } = await next.forResult()

				let top = moved[0], bottom = moved[1], hand = moved[2];
				top.reverse();
				game.cardsGotoPile(top.concat(bottom), ['top_cards', top], function (event, card) {
					if (event.top_cards.includes(card)) return ui.cardPile.firstChild;
					return null;
				});
				await player.gain(hand, 'gain2', 'log');
				player.popup(get.cnNumber(top.length) + '上' + get.cnNumber(bottom.length) + '下');
				game.log(player, '将' + get.cnNumber(top.length) + '张牌置于牌堆顶');

				if (!hs.length || !hs.some(i => player.getCards('h').includes(i))) {
					game.log('#g【天覆】', '手牌全部被置换');
					await player.draw();
				}
			},
			group: 'mengtianfu_add',
			subSkill: {
				add: {
					audio: 'mengtianfu',
					trigger: {
						global: 'changeHp'
					},
					filter(event, player) {
						return event.num != 0 && player.countMark('mengtianfu') < 5;
					},
					forced: true,
					async content(event, trigger, player) {
						player.addMark('mengtianfu', Math.min(5 - player.countMark('mengtianfu'), Math.abs(trigger.num)));
						player.markSkill('mengtianfu');
					},
				}
			},
			ai: {
				threaten: 1.2,
			},
			"_priority": 0,
		},
		mengdizai: {
			audio: 2,
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				if (game.countPlayer() < 3) return false;
				return player.countCards('he') > 0;
			},
			position: "he",
			filterCard: true,
			filterTarget(card, player, target) {
				return player != target;
			},
			check(card) {
				return 6 - get.value(card);
			},
			selectTarget: 2,
			multitarget: true,
			multiline: true,
			targetprompt: ["拼点发起人", "拼点目标"],
			async content(event, trigger, player) {
				const [target1, target2] = event.targets;
				await target1.draw('bottom');
				await target2.draw('bottom');
				if (target1.canCompare(target2)) {
					const { winner, player: card1, target: card2 } = await target1.chooseToCompare(target2).forResult()
					if (winner == target1 && winner != target2) {
						await target1.chooseToDiscard('he', 2, true);
						await target2.damage(target1);
					} else if (winner == target2 && winner != target1) {
						await target2.chooseToDiscard('he', 2, true);
						await target1.damage(target2);
					} else if (winner != target1 && winner != target2) {
						await player.gain([card1, card2].filterInD('d'), 'gain2').gaintag.add('mengdizai');;
					}
				}
			},
			ai: {
				order: 1,
				result: {
					target: -1,
				},
			},
			group: 'mengdizai_tag',
			subSkill: {
				tag: {
					charlotte: true,
					onremove(player) {
						player.removeGaintag('mengdizai');
					},
					mod: {
						ignoredHandcard(card, player) {
							if (card.hasGaintag('mengdizai')) return true;
						},
						cardDiscardable(card, player, name) {
							if (name == 'phaseDiscard' && card.hasGaintag('mengdizai')) return false;
						},
					},
				},
			},
			"_priority": 0,
		},
		mengfengyang: {
			audio: 2,
			trigger: {
				global: "chooseToCompareAfter",
			},
			filter(event, player) {
				if (event.preserve) return false;
				return true;
			},
			async cost(event, trigger, player) {
				const loseEr = [], targets = trigger.result.targets?.length > 1 ? trigger.targets : [trigger.target];
				let str = targets.length > 1 ? '目标数大于1' : '目标数唯一'

				const num1 = trigger.num1;
				str += `<li>${get.translation(trigger.player)}的拼点牌为${num1}`
				for (let i = 0; i < targets.length; i++) {
					const num2 = targets.length > 1 ? trigger.result.num2[i] : trigger.result.num2;
					str += '<li>' + get.translation(targets[i]) + '的拼点牌为' + num2;
					let str2 = '<li>本次拼点没赢的角色为：';
					if (num1 > num2) {
						str2 += `[${get.translation(targets[i])}]`
						loseEr.add(targets[i])
					}
					else if (num1 < num2) {
						str2 += `[${get.translation(trigger.player)}]`
						loseEr.add(trigger.player)
					}
					else if (num1 == num2) {
						str2 += `[${get.translation(targets[i])}]`
						str2 += `[${get.translation(trigger.player)}]`
						loseEr.add(targets[i])
						loseEr.add(trigger.player)
					}
					str += str2;
				}
				game.log('#g【风扬】', str);
				if (loseEr.some(i => i != player && i.countCards('h') > 0)) {
					event.result = await player.chooseBool('风扬：是否观看并依次交换' + get.translation(loseEr) + '的手牌？').forResult()
					event.result.targets = loseEr.sortBySeat();
				} else {
					game.log('#g【风扬】', loseEr, '没有手牌');
				}
			},
			async content(event, trigger, player) {
				let bool;
				if (event.targets.length == 1) bool = true;
				for (const target of event.targets) {
					if (target == player) continue;
					if (!target.countCards('h')) continue;
					if (!bool) bool = (await player.chooseBool('风扬：是否观看并依次交换' + get.translation(target) + '的手牌？').forResult()).bool;
					if (bool) {
						bool = false
						let next = player.chooseToMove('风场：交换你们的手牌');
						next.set('list', [
							[get.translation(target) + '的手牌', target.getCards('h')],
							['你的手牌', player.countCards('h') > 0 ? player.getCards('h') : []],
						]);
						next.set('filterMove', function (from, to) {
							return typeof to != 'number';
						});
						next.set('processAI', function (list) {
							var cards = list[0][1].concat(list[1][1]).sort(function (a, b) {
								return get.value(a) - get.value(b);
							}), cards2 = cards.splice(0, target.countCards('h'));
							return [cards2, cards];
						});
						const { moved } = await next.forResult();
						if (moved) {
							let pushs = moved[0].filter(i => !target.getCards('h').includes(i));
							let gains = moved[1].filter(i => !player.getCards('h').includes(i));
							if (!pushs.length || pushs.length != gains.length) return;
							await player.swapHandcards(target, pushs, gains)
						}
					}
				}
			},
			ai: {
				noCompareTarget: true,
			},
			"_priority": 0,
		},
		"mengtianfu_info": "天覆|锁定技，每当有角色体力值发生变化时，你获得与变化数等量的“星”（至多为5）。准备阶段，你移除所有“星”标记并观看牌堆顶等量的牌，你可以用手牌交换这些牌并将这些牌置于牌堆顶和牌堆底。",
		"mengdizai_info": "地载|出牌阶段限一次，你可以弃置一张牌，令选择两名其他角色从牌堆底各摸一张牌，并进行拼点。赢的角色弃置两张牌并对没赢的角色造成一点伤害；若均没赢，则你获得两张拼点牌（不计入手牌上限）。",
		"mengfengyang_info": "风扬|你不能成为其他角色拼点的目标。一名角色发动拼点后，你可以依次观看并用任意张手牌交换此次拼点中没赢的角色的手牌。",

		hyyz_ys_kalilu: ['卡莉露', ["female", "hyyz_ys", 3, ["menglinting", "mengquanxin"], []], '沧海依酥'],
		menglinting: {
			trigger: {
				global: 'useCardToPlayer'
			},
			filter(event, player) {
				var info = get.info(event.card, false);
				if (info.allowMultiple == false) return false;
				if (get.tag(event.card, 'damage') || get.timetype(event.card) != 'notime') return false;
				return game.hasPlayer(function (current) {
					return current.countCards('he') > 0 && !event.targets.includes(current) && event.player.canUse(event.card, current);
				});
			},
			async cost(event, trigger, player) {
				const result = await player
					.chooseTarget('聆听：将非目标的一张牌交给' + get.translation(trigger.player) + '，然后令该角色加入' + get.translation(trigger.card) + '的目标')
					.set('filterTarget', (card, player, target) => {
						return target.countCards('he') && !trigger.targets.includes(target) && trigger.player.canUse(trigger.card, target);
					})
					.set('ai', (target) => get.effect(target, trigger.card, player, player) * Math.sign(get.attitude2(trigger.player)))
					.forResult();
				event.result = result;
			},
			usable: 1,
			logTarget: 'targets',
			async content(event, trigger, player) {
				const { cards } = await player
					.choosePlayerCard('he', event.targets[0], true)
					.forResult();
				if (cards) {
					trigger.player.gain(cards, event.targets[0], 'give');
					trigger.getParent().targets.add(event.targets[0]);
				}
			},
		},
		mengquanxin: {
			usable: 1,
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				//if (!player.isPhaseUsing()) return false;
				return lib.nature.some(name => {
					return get.type(name) && !get.tag({ name: name }, 'damage') && event.filterCard({ name: name }, player, event) && get.timetype(name) == 'notime';
				});
			},
			chooseButton: {
				dialog(event, player) {
					var list = [];
					for (var name of lib.inpile) {
						if (get.type(name) == 'trick' &&
							event.filterCard({ name: name }, player, event) &&
							!get.tag({ name: name }, 'damage') &&
							get.timetype(name) == 'notime')
							list.push(['锦囊', '', name]);
					}
					return ui.create.dialog('泉心', [list, 'vcard']);
				},
				filter(button, player) {
					return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
				},
				check(button) {
					if (_status.event.getParent().type != 'phase') return 1;
					var player = _status.event.player;
					if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
					return player.getUseValue({
						name: button.link[2],
						nature: button.link[3],
					});
				},
				backup(links, player) {
					return {
						filterCard: () => false,
						selectCard: -1,
						popname: true,
						check(card) {
							return 8 - get.value(card);
						},
						position: 'hse',
						viewAs: {
							name: links[0][2],
							nature: links[0][3]
						},
					}
				},
				prompt(links, player) {
					return '视为使用' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '';
				},
			},
			hiddenCard(player, name) {
				var type = get.type(name);
				return type == 'trick' && !get.tag(name, 'damage') && get.timetype(name) == 'notime'
			},
			ai: {
				order: 10,
				result: {
					player: 1,
				},
			},
		},
		menglinting_info: "聆听|每回合限一次，一名角色使用非伤害类即时牌指定目标时，你可以将非目标角色的一张牌交给使用者，然后令该角色加入目标。",
		mengquanxin_info: "泉心|每回合限一次，你可以视为使用一张非伤害类即时锦囊牌。",
	},
	2311: {
		hyyz_xt_jingliu: ['镜流', ["female", "hyyz_xt", 4, ["hyyzfeiguang", "hyyzzhuanpo"], []], '紫灵谷的骊歌', '镜流，曾经的罗浮剑首，云骑军不败盛名的缔造者。而今其名字已被抹去，成为行走于魔阴身边缘的仙舟叛徒，汲汲追寻旧日的夙愿。倒在她剑下的丰饶之民数不胜数，造翼者的羽卫，步离人的父狼，连高如山岳的器兽也当不住她的一击，可最终因魔阴神智狂乱、大开杀戒，成了逃亡域外的重犯。'],
		hyyzfeiguang: {
			audio: 8,
			$tip(player) {
				const storage1 = player.storage.hyyzfeiguang, storage2 = player.storage.hyyzzhuanpo;
				if (!storage1) {
					if (!storage2) {//双阳
						player.addTip('hyyzfeiguang', '飞光 转化')
						player.addTip('hyyzzhuanpo', '转魄 直伤')
					} else {
						player.addTip('hyyzfeiguang', '飞光 视为')
						player.addTip('hyyzzhuanpo', '转魄 免费')
					}
				} else {
					if (!storage2) {
						player.addTip('hyyzfeiguang', '飞光 弃牌')
						player.addTip('hyyzzhuanpo', '转魄 直伤')
					} else {//双阴
						player.addTip('hyyzfeiguang', '飞光 获得')
						player.addTip('hyyzzhuanpo', '转魄 免费')
					}
				}
				player.addTip('hyyzzhuanpo', '转魄 直伤')
			},
			init(player) {
				player.storage.hyyzfeiguang = false;
				lib.skill.hyyzfeiguang.$tip(player)
			},
			mark: true,
			marktext: "☯",
			zhuanhuanji(player, skill) {
				player.storage[skill] = !player.storage[skill]
				lib.skill.hyyzfeiguang.$tip(player)
			},
			intro: {
				content(storage, player, skill) {
					var str = '';
					if (player.storage.hyyzzhuanpo) {
						if (player.storage.hyyzfeiguang == false) str += '阳：每回合限一次，你可以视为使用或打出一张不计入次数冰【杀】';
						else str += '阴：你受到伤害后获得四张基本牌';
					} else {
						if (player.storage.hyyzfeiguang == false) str += '阳：每回合限一次，你可以将一张牌当不计入次数的冰【杀】使用或打出';
						else str += '阴：你受到伤害后须弃置所有黑色手牌，然后获得四张与弃置牌颜色不同的基本牌';
					}
					return str;
				},
			},
			group: ['hyyzfeiguang_use', 'hyyzfeiguang_dam'],
			subSkill: {
				use: {
					enable: ["chooseToRespond", "chooseToUse"],
					usable: 1,
					filter(event, player) {
						return player.countCards('he') > 0 && player.storage.hyyzfeiguang == false;
					},
					position: "hes",
					prompt(event, player) {
						var player = _status.event.player;
						if (!player.hasSkill('hyyzzhuanpo') || !player.storage.hyyzzhuanpo) {
							return '将一张牌当不计入次数的冰【杀】使用或打出'
						} else {
							return '视为使用或打出一张不计入次数的冰【杀】'
						}
					},
					filterCard(card, player, event) {
						return !player.hasSkill('hyyzzhuanpo') || !player.storage.hyyzzhuanpo;
					},
					selectCard(card) {
						var player = _status.event.player;
						if (!player.hasSkill('hyyzzhuanpo') || !player.storage.hyyzzhuanpo) {
							return 1;
						} else {
							return -1;
						}
					},
					viewAs: {
						name: "sha",
						nature: "ice",
						storage: {
							hyyzfeiguang: true,
						}
					},
					check(card) {
						return 8 - get.value(card)
					},
					async precontent(event, trigger, player) {
						event.getParent().addCount = false;
					},
					onuse(links, player) {
						player.changeZhuanhuanji('hyyzfeiguang');
						if (player.hasSkill('hyyzzhuanpo') && player.storage.hyyzzhuanpo) {
							game.hyyzSkillAudio('hyyzfeiguang', 3, 4)
							player.changeZhuanhuanji('hyyzzhuanpo');
						} else {
							game.hyyzSkillAudio('hyyzfeiguang', 1, 2)
						}
					},
					onrespond(links, player) {
						player.changeZhuanhuanji('hyyzfeiguang');
						if (player.hasSkill('hyyzzhuanpo') && player.storage.hyyzzhuanpo) {
							game.hyyzSkillAudio('hyyzfeiguang', 3, 4)
							player.changeZhuanhuanji('hyyzzhuanpo');
						} else {
							game.hyyzSkillAudio('hyyzfeiguang', 1, 2)
						}
					},
				},
				dam: {
					trigger: {
						player: 'damageEnd'
					},
					filter(event, player) {
						return player.storage.hyyzfeiguang
					},
					check(event, player) {
						if (player.hasSkill('hyyzzhuanpo') && player.storage.hyyzzhuanpo) {
							return true//player.countCards('h') > 0;
						} else {
							return player.countCards('h', { color: 'black' }) < 4;
						}
					},
					prompt2(event, player) {
						if (player.hasSkill('hyyzzhuanpo') && player.storage.hyyzzhuanpo) {
							return '获得四张基本牌';
						} else {
							if (player.countCards('h', { color: 'black' }) > 0) {
								return '弃置所有黑色手牌，然后获得四张红色基本牌';
							} else {
								return '弃置所有黑色手牌，然后获得四张基本牌';
							}
						}
					},
					async cost(event, trigger, player) {
						event.result = { bool: true }
					},
					async content(event, trigger, player) {
						player.changeZhuanhuanji('hyyzfeiguang');
						const colors = ['red', 'black']

						if (player.storage.hyyzzhuanpo && player.countCards('h', { color: 'black' }) > 0) {//抵消
							game.hyyzSkillAudio('hyyzfeiguang', 7, 8)
							player.changeZhuanhuanji('hyyzzhuanpo');
						} else {
							game.hyyzSkillAudio('hyyzfeiguang', 5, 6)
							if (player.countCards('h', { color: 'black' }) > 0) {
								await player.discard(player.getCards('h', { color: 'black' }));
								colors.remove('black')
							}
						}
						const cards = [];
						while (cards.length < 4) {
							var card = get.cardPile(function (card) {
								return get.type(card) == 'basic' && colors.includes(get.color(card)) && !cards.includes(card);
							});
							if (card) cards.push(card);
						}
						if (cards.length) await player.gain(cards, 'gain2');
					},
					ai: {
						maixie: true,
						"maixie_hp": true,
						result: {
							effect(card, player, target) {
								if (get.tag(card, 'damage') && target.storage.hyyzfeiguang != false) {
									if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
									if (!target.hasFriend()) return;
									var num = 1;
									if (get.attitude(player, target) > 0) {
										if (player.needsToDiscard()) {
											num = 0.7;
										}
										else {
											num = 0.5;
										}
									}
									if (target.hp >= 4) return [1, num * 2];
									if (target.hp == 3) return [1, num * 1.5];
									if (target.hp == 2) return [1, num * 0.5];
								}
							},
						},
						threaten: 0.6,
					},
				},
			},
		},
		hyyzzhuanpo: {
			audio: 2,
			init(player) {
				player.storage.hyyzzhuanpo = false;
				lib.skill.hyyzfeiguang.$tip(player)
			},
			mark: true,
			marktext: "☯",
			zhuanhuanji(player, skill) {
				player.storage[skill] = !player.storage[skill]
				lib.skill.hyyzfeiguang.$tip(player)
			},
			intro: {
				content(storage, player, skill) {
					var str = '';
					if (player.storage.hyyzzhuanpo == false) str += '阳：你使用【杀】指定目标后，可以对自己或曾对其造成过伤害的角色造成1点伤害并令此【杀】不可被响应';
					else str += '阴：你发动〖飞光〗时不消耗手牌';
					return str;
				},
			},
			trigger: { player: "useCardToTargeted" },
			filter(event, player) {
				if (player.storage.hyyzzhuanpo || event.card.name != 'sha') return false;
				if (!event.targets.length) return false;
				return true || event.target.getAllHistory('damage', function (evt) {
					if (!evt || !evt.source || !evt.source.isAlive()) return false;
					return true;
				}).length > 0;
			},
			async cost(event, trigger, player) {
				let targetx = [player];
				trigger.target.getAllHistory('damage', function (evt) {
					if (!evt || !evt.source || !evt.source.isAlive()) return false;
					targetx.add(evt.source);
				});
				const result = await player
					.chooseTarget('转魄：对自己或一名伤害来源造成1点伤害，然后此【杀】不可被响应')
					.set('filterTarget', (card, player, target) => targetx.includes(target))
					.set('ai', function (target) {
						if (player.hasSkill('hyyzfeiguang') && player.storage.hyyzfeiguang != false) {
							if (player.hp > 3) return target == player;
						}
						return get.damageEffect(target, player, player, 'fire');
					})
					.forResult();
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				player.changeZhuanhuanji('hyyzzhuanpo');
				target.damage();
				trigger.getParent().directHit.addArray(game.filterPlayer());
			},
		},
		hyyzfeiguang_info: "飞光|转换技，<br>阳：每回合限一次，你可以将一张牌当不计次数的冰【杀】使用或打出。<br>阴：你受到伤害后须弃置所有黑色手牌，然后获得四张与弃置牌颜色不同的基本牌。",
		hyyzzhuanpo_info: "转魄|转换技。<br>阳：你使用【杀】指定目标后，可以对自己或曾对其造成过伤害的角色造成1点伤害并令此【杀】不可被响应。<br>阴：你发动〖飞光〗时不消耗手牌。",

		hyyz_xt_huohuo: ['藿藿', ["female", "hyyz_xt", 3, ["hyyzqienuo", "hyyzqushen", "hyyzsuiyang"], []], '紫灵谷的骊歌', '可怜又弱小的狐人小姑娘，也是怕鬼捉鬼的罗浮十王司见习判官。<br>名为「尾巴」的岁阳被十王司的判官封印在她的颀尾上，使她成为了招邪的「贞凶之命」。<br>害怕妖魔邪物，却总是受命捉拿邪祟，完成艰巨的除魔任务；<br>自认能力不足，却无法鼓起勇气辞职，只好默默害怕地继续下去。'],
		hyyzqienuo: {
			audio: 4,
			logAudio(event, player, triggername, indexedData, costResult) {
				return event.player == player ? [
					'ext:忽悠宇宙/asset/character/audio/hyyzqienuo1.mp3',
					'ext:忽悠宇宙/asset/character/audio/hyyzqienuo2.mp3',
				] : [
					'ext:忽悠宇宙/asset/character/audio/hyyzqienuo3.mp3',
					'ext:忽悠宇宙/asset/character/audio/hyyzqienuo4.mp3',
				]
			},
			trigger: {
				global: "useCard",
			},
			forced: true,
			filter(event, player) {
				if (!event.targets || event.targets.length != 1) return false;
				if (event.targets[0] == event.player) return false;
				if (event.player == player) {
					return get.type(event.card) == 'basic'
				} else {
					return get.type(event.card) == 'trick' && event.targets[0] == player;
				}
			},
			async content(event, trigger, player) {
				game.log(player, '将', trigger.card, '的使用者由', trigger.player, '改为', trigger.targets[0]);
				trigger.untrigger();
				trigger.player = trigger.targets[0];
			},
		},
		hyyzqushen: {
			audio: 2,
			trigger: {
				global: "useCardToTarget",
			},
			filter(event, player) {
				if (player.countCards('he') <= 0) return false;
				if (!event.targets || event.targets.length != 1 || event.targets[0] != event.player) return false;
				if (!['basic', 'trick'].includes(get.type(event.card))) return false;
				return game.hasPlayer(function (current) {
					return !event.targets.includes(current) && lib.filter.targetEnabled2(event.card, event.player, current);
				});
			},
			usable: 1,
			async cost(event, trigger, player) {
				event.result = await player
					.chooseCardTarget({
						prompt: '驱神：是否增加一个目标？',
						prompt2: `使用者为${get.translation(trigger.player)}且${get.type(trigger.card) == 'basic' ? '额外目标[净化]' : '此牌不能被【无懈可击】响应'} `,
						filterCard(card, player) {
							return lib.filter.cardDiscardable(card, player);
						},
						filterTarget(card, player, target) {
							let trigger = _status.event.getTrigger();
							return !trigger.targets.includes(target) && lib.filter.targetEnabled2(trigger.card, trigger.player, target);
						},
						position: 'he',
						ai1(card) {
							return 8 - get.value(card);
						},
						ai2(target) {
							let player = _status.event.player, card = _status.event.getTrigger().card;
							let eff = get.effect(target, card, player, player), type = get.type2(card);
							let val = eff;
							if (eff > 0) {
								if (type == 'basic' && target.canhyyzJinghua()) val *= 2;
							} else {
								if (type == 'basic' && target.canhyyzJinghua()) val /= 2;
							}
							return eff;
						},
					})
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const cards = event.cards, target = event.targets[0];
				await player.discard(cards);
				player.line(target);
				trigger.targets.add(target);
				if (get.type(trigger.card) == 'basic') {
					trigger.targets.map(player => player.hyyzJinghua());
				} else {
					trigger.getParent().nowuxie = true;
				}

			},
			"_priority": 0,
		},
		hyyzsuiyang: {
			audio: 5,
			mark: true,
			intro: {
				content: "limited",
			},
			init(player, skill) {
				player.storage[skill] = false;
			},
			unique: true,
			enable: "phaseUse",
			filter: (event, player) => !player.storage.hyyzsuiyang,
			limited: true,
			skillAnimation: "epic",
			direct: true,
			animationColor: "wood",
			async content(event, trigger, player) {
				game.hyyzSkillAudio('hyyzsuiyang', 1)
				player.awakenSkill('hyyzsuiyang');

				var list = [];
				for (var i = 0; i < lib.inpile.length; i++) {
					var name = lib.inpile[i];
					if (get.type(name) == 'basic') list.push(['基本', '', name]);
				}
				const { links } = await player
					.chooseButton(true, ['岁阳：选择“岁阳”', [list, 'vcard'], true])
					.set('ai', function (button) {
						var value = 0;
						if (button.link[2] == 'tao') value += 4;
						if (button.link[2] == 'jiu') value += 3;
						if (button.link[2] == 'shan') value += 2;
						if (button.link[2] == 'sha') value += 1;
						return value;
					})
					.forResult();
				if (links) {
					let name = links[0][2];
					player.addSkill('hyyzsuiyang_buff');
					player.storage.hyyzsuiyang_buff = name;
					let card = get.cardPile2(card => card.name == name);
					if (card) {
						await player.gain(card, 'gain2').gaintag.add('hyyzsuiyang');
						await player.loseHp();
					}
				}
			},
			ai: {
				order: 9,
				result: {
					player: 1,
				},
			},
		},
		hyyzsuiyang_buff: {
			mark: true,
			marktext: "岁阳",
			onremove: true,
			intro: {
				name: "岁阳",
				mark(dialog, content, player) {
					if (player == game.me || player.isUnderControl()) {
						dialog.addText('已被“岁阳”寄生：');
						dialog.addSmall([[player.storage.hyyzsuiyang_buff], 'vcard']);
					} else dialog.addText('该角色已被“岁阳”寄生');
				},
				content: "岁阳名：$",
			},
			trigger: {
				global: "phaseEnd",
			},
			filter(event, player) {
				return !player.countCards('h', (card) => card.hasGaintag('hyyzsuiyang'));
			},
			charlotte: true,
			silent: true,
			async content(event, trigger, player) {
				let card = get.cardPile((card) => card.name == player.storage.hyyzsuiyang_buff);
				if (card) player.gain(card, 'draw').gaintag.add('hyyzsuiyang');
			},
			group: ['hyyzsuiyang_buff_use', 'hyyzsuiyang_buff_damage'],
			subSkill: {
				use: {
					forced: true,
					charlotte: true,
					silent: true,
					trigger: {
						player: "useCard1",
					},
					filter(event, player) {
						return player.hasHistory('lose', function (evt) {
							if (evt.getParent() != event) return false;
							for (var i in evt.gaintag_map) {
								if (evt.gaintag_map[i].includes('hyyzsuiyang')) return true;
							}
							return false;
						});
					},
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyzsuiyang', 2, 3)
					},
				},
				damage: {
					forced: true,
					charlotte: true,
					locked: false,
					silent: true,
					trigger: {
						player: 'damageBegin'
					},
					filter(event, player) {
						return player.countCards('h', (card) => card.hasGaintag('hyyzsuiyang')) > 0;
					},
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyzsuiyang', 4, 5)
					}
				},
			},
		},
		"hyyzqienuo_info": "怯懦|锁定技，当你使用单体基本牌时，或其他角色对你使用单体普通锦囊牌时，目标角色成为此牌的使用者。",
		hyyzqushen_info: "驱神|每回合限一次。当一名角色使用基本牌或普通锦囊牌指定自己为唯一目标时，你可以弃置一张牌并为此牌增加一个目标。若此牌为基本牌，目标角色" + get.hyyzIntroduce('净化') + "；否则，此牌不能被【无懈可击】响应。",
		hyyzsuiyang_info: "岁阳|限定技，出牌阶段，你可以获得一张基本牌，然后失去1点体力。每回合结束时，若你没有〖岁阳〗牌，从牌堆获得之。",

		hyyz_ɸ_yelianna: ['叶莲娜', ["female", "hyyz_ɸ", 4, ["mengdonghen", "mengjiannu", "mengrongyu"], []], '日玖阳气冲三关', '尾巴已对技能〖融语〗进行修改，若有其他方案可私信尾巴修改。'],
		mengdonghen: {
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content(storage, player, skill) {
					var str = '当你成为其他角色使用牌的目标后，';
					if (player.storage.mengdonghen == true) str += '阴：失去1点体力并获得此牌';
					else str += '阳：此牌对你无效';
					return str;
				},
			},
			prompt(event, player) {
				var str = '';
				if (player.storage.mengdonghen == true) str += '失去1点体力并获得' + get.translation(event.card);
				else str += get.translation(event.card) + '对你无效';
				return str;
			},
			check(event, player) {
				if (player.storage.mengdonghen == true) {
					return player.hp > 1;
				} else {
					return -get.effect(player, event.card, event.player, player)
				}
			},
			locked: true,
			trigger: {
				target: 'useCardToTargeted'
			},
			filter(event, player) {
				return event.card && event.player != player;
			},
			content() {
				'step 0'
				player.changeZhuanhuanji('mengdonghen');
				if (player.storage.mengdonghen != true) {//阳
					player.loseHp();
					player.gain(trigger.cards, 'gain2');
				}
				else {//阴
					game.log('#g【冬痕】', trigger.card, '对', player, '无效')
					trigger.getParent().excluded.add(player);
				}
			},
		},
		mengjiannu: {
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return player.countCards('h') > 0;
			},
			async content(event, trigger, player) {
				var prompt = '###' + get.prompt('mengjiannu') + '###重铸一种花色的所有牌';
				const next = player.chooseButton(true, [prompt, [lib.suit.map(i => ['', '', 'lukai_' + i]), 'vcard']], 1);
				next.set('filterButton', button => {
					var player = _status.event.player;
					var cards = player.getCards('h', { suit: button.link[2].slice(6) });
					return cards.length > 0 && cards.filter(card => lib.filter.cardDiscardable(card, player)).length == cards.length;
				});
				next.set('ai', button => {
					var player = _status.event.player;
					return 30 - player.getCards('h', { suit: button.link[2].slice(6) }).map(i => get.value(i)).reduce((p, c) => p + c, 0);
				});
				next.set('custom', {
					replace: {
						button(button) {
							if (!_status.event.isMine()) return;
							if (!_status.event.isMine()) return;
							if (button.classList.contains('selectable') == false) return;
							var cards = _status.event.player.getCards('h', { suit: button.link[2].slice(6) });
							if (cards.length) {
								var chosen = cards.filter(i => ui.selected.cards.contains(i)).length == cards.length;
								if (chosen) {
									ui.selected.cards.removeArray(cards);
									cards.forEach(card => {
										card.classList.remove('selected');
										card.updateTransform(false);
									});
								} else {
									ui.selected.cards.addArray(cards);
									cards.forEach(card => {
										card.classList.add('selected');
										card.updateTransform(true);
									});
								}
							}
							if (button.classList.contains('selected')) {
								ui.selected.buttons.remove(button);
								button.classList.remove('selected');
								if (_status.multitarget || _status.event.complexSelect) {
									game.uncheck();
									game.check();
								}
							}
							else {
								button.classList.add('selected');
								ui.selected.buttons.add(button);
							}
							var custom = _status.event.custom;
							if (custom && custom.add && custom.add.button) {
								custom.add.button();
							}
							game.check();
						}
					},
					add: next.custom.add
				});
				const { cards } = await next.forResult()
				if (cards) {
					await player.recast(cards);
					const card = get.autoViewAs({ name: 'sha', nature: 'ice' })
					const { bool } = await player.chooseUseTarget('视为使用一张冰【杀】，或点取消摸一张牌', card, false).forResult()
					if (!bool) await player.draw()
				}
			},
			onremove: true,
			group: 'mengjiannu_lose',
			subSkill: {
				lose: {
					trigger: {
						player: 'loseAfter',
					},
					filter(event, player) {
						return event.hs.some(card => !player.countCards('h', { suit: get.suit(card) }) && !player.getStorage('mengjiannu').includes(get.suit(card)))
					},
					async cost(event, trigger, player) {
						player.storage.mengjiannu ??= []
						for (let card of trigger.hs) {
							const suit = get.suit(card);
							if (!player.countCards('h', { suit: suit }) && !player.getStorage('mengjiannu').includes(suit)) {
								player.storage.mengjiannu.add(suit)
							}
						}
						player.addTip('mengjiannu', '缄怒 ' + player.storage.mengjiannu.map(suit => get.hyyzSuit(suit)).join(''))

						if (player.getStorage('mengjiannu').length >= 4) {
							event.result = await player
								.chooseTarget(get.prompt('mengjiannu'), true, '造成1点冰冻伤害')
								.set('ai', function (target) {
									var player = _status.event.player;
									return get.damageEffect(target, player, player, 'ice');
								})
								.forResult()
						}
					},
					async content(event, trigger, player) {
						event.targets[0].damage('ice');
						delete player.storage.mengjiannu
						player.removeTip('mengjiannu')
					}
				}
			}
		},
		mengrongyu: {
			mod: {
				maxHandcard(player, num) {
					return num++;
				},
			},
			trigger: {
				player: "dieBegin",
			},
			async cost(event, trigger, player) {
				const result = await player.chooseTarget(get.prompt2('mengrongyu'), function (card, player, target) {
					return player != target;
				})
					.set('ai', function (target) {
						var att = get.attitude(_status.event.player, target);
						if (att > 0) {
							if (target.countCards('hs', { name: 'tao' })) return true;
							if (target.countCards('hs', { name: 'jiu' })) return true;
						}
						return -target.hp * att;
					})
					.forResult();
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				var num = target.hp;
				target.damage(num, 'nosource');
				target.recover(num);
				target.addSkills(['jsrgfeiyang', 'jsrgbahu'])
			},
			ai: {
				threaten(player, target) {
					if (target.hp == 1) return 2;
					return 0.5;
				},
			},
			"_priority": 0,
		},
		"mengdonghen_info": "冬痕|转换技，当你成为其他角色使用牌的目标后，阳：令此牌对你无效。阴：你失去1点体力并获得此牌。",
		"mengjiannu_info": "缄怒|①出牌阶段限一次，你可以重铸一种花色的所有手牌，然后摸一张牌或视为使用一张不计入使用次数的冰【杀】。②当你每累计失去每种花色的所有手牌后，对一名角色造成1点冰属性伤害。",
		mengrongyu_info: "融语|你的手牌上限+1。当你死亡时，〖夷灭〗一名其他角色，然后其获得〖飞扬〗〖跋扈〗。",

		hyyz_b3_saixiliya: ['塞西莉亚', ["female", "hyyz_b3", "3/5", ["mengxieheng"], []], '七夕月', ''],
		mengxieheng: {
			forced: true,
			group: ['mengxieheng_1', 'mengxieheng_2', 'mengxieheng_3'],
			subSkill: {
				1: {
					mark: true,
					marktext: "☯",
					zhuanhuanji: true,
					intro: {
						content(storage, player, skill) {
							return (player.storage.mengxieheng_1 ? '阴：你使用【桃】时' : '阳：你使用【杀】时') + '，令所有角色加入此牌目标。';
						},
					},
					trigger: {
						player: "useCard1",
					},
					forced: true,
					filter(event, player) {
						return event.card.name == (player.storage.mengxieheng_1 ? 'tao' : 'sha');
					},
					logTarget() {
						return game.filterPlayer()
					},
					async content(event, trigger, player) {
						player.changeZhuanhuanji('mengxieheng_1');
						trigger.targets = game.filterPlayer();
					},
					ai: {
						threaten: 1.05,
						effect: {
							player(card, player, target, num) {
								if (player.storage.mengxieheng_1 && card.name != 'tao') return;
								if (!player.storage.mengxieheng_1 && card.name != 'sha') return;
								let val = 0;
								game.countPlayer(current => {
									val += lib.card[card.name].ai.result.target(player, current);
								})
								return [0, val + (player.hp - 2)];
							}
						}
					},
				},
				2: {
					mark: true,
					marktext: "☯",
					zhuanhuanji: true,
					intro: {
						content(storage, player, skill) {
							return (player.storage.mengxieheng_2 ? '阴：你使用牌时，若目标包含自己，将自己移出目标。' : '阳：你使用牌时，若目标包含其他角色，将其他角色移出目标。')
						},
					},
					trigger: {
						player: "useCard",
					},
					forced: true,
					filter(event, player) {
						if (event.mengxieheng_2) return false
						if (player.storage.mengxieheng_2 != true) {//阳
							return event.targets.some(target => target != player)
						} else {
							return event.targets.some(target => target == player)
						}
					},
					logTarget(event, player) {
						return player.storage.mengxieheng_2 ? player : game.filterPlayer(i => i != player)
					},
					async content(event, trigger, player) {
						trigger.mengxieheng_2 = true;
						if (player.storage.mengxieheng_2 != true) {//阳
							trigger.targets.removeArray(game.filterPlayer(current => current != player));
						} else {
							trigger.targets.remove(player)
						};
						player.changeZhuanhuanji('mengxieheng_2');
					},
					ai: {
						threaten: 1.05,
						effect: {
							player(card, player, target) {
								if (player.storage.mengxieheng_2 && target == player) return 'zeroplayer'
								if (!player.storage.mengxieheng_2 && target != player) return 'zerotarget';
							}
						}
					},
				},
				3: {
					mark: true,
					marktext: "☯",
					zhuanhuanji: true,
					intro: {
						content(storage, player, skill) {
							var str = '';
							if (player.storage.mengxieheng_3) str += '阴：你使用的牌结算后，若有角色因此牌受到伤害或回复体力，你失去一点体力并获得此牌，且此牌不计入使用次数。';
							else str += '阳：你使用的牌结算后，若没有角色因此牌受到伤害或回复体力，你将手牌摸至或弃置至已损失体力值，然后本回合你使用同类型的牌额外结算一次。';
							return str;
						},
					},
					trigger: {
						player: "useCardAfter",
					},
					forced: true,
					filter(event, player) {
						if (event.mengxieheng_3) return false;
						let history = game.getGlobalHistory('everything', evt => (evt.name == 'damage' || evt.name == 'recover') && evt.card == event.card);
						if (player.storage.mengxieheng_3) {
							return history.length > 0
						} else {
							return !history.length
						}
					},
					async content(event, trigger, player) {
						trigger.mengxieheng_3 = true
						player.changeZhuanhuanji('mengxieheng_3');
						if (!player.storage.mengxieheng_3) {
							await player.loseHp();
							await player.gain(trigger.cards, 'gain2');
							if (player.getStat().card[trigger.card.name]) player.getStat().card[trigger.card.name]--;
						} else {
							const num = player.countCards('h') - player.getDamagedHp();
							if (num > 0) await trigger.player.chooseToDiscard('h', true, num)
							else await trigger.player.draw(-num);
							player.storage.mengxieheng_add = get.type2(trigger.card);
							player.addTempSkill('mengxieheng_add');
						}
					},
					ai: {
						threaten: 1.05,
						effect: {
							player(card, player, target) {
								if (player.storage.mengxieheng_3 && (get.tag(card, 'damage') > 0 || get.tag(card, 'recover') > 0)) {
									if (player.hp <= 1) return -2;
									return [1, 0.5]
								}
								if (!player.storage.mengxieheng_3 && !get.tag(card, 'damage') && !get.tag(card, 'recover')) {
									return [1, player.getDamagedHp() - player.countCards('h') + 2];
								}
							}
						}
					},
				},
				add: {
					onremove: true,
					trigger: {
						player: "useCard1",
					},
					charlotte: true,
					silent: true,
					filter(event, player) {
						return player.storage.mengxieheng_add == get.type2(event.card);
					},
					async content(event, trigger, player) {
						trigger.effectCount++;
					},
					ai: {
						effect: {
							player(card, player, target) {
								if (player.storage.mengxieheng_add == get.type2(card)) {
									return 2
								}
							}
						}
					}
				}
			}
		},
		mengxieheng_info: `血痕|锁定技。<br>
		转换技，阳：你使用【杀】时1；<br>阴：你使用【桃】时1，令所有角色加入此牌目标。<br>
		转换技，阳：你使用牌时2，若目标包含其他角色，将其他角色移出目标；阴：你使用牌时2，若目标包含自己，将自己移出目标。<br>
		转换技，阳：你使用牌后，若没有角色因此牌受到伤害或回复体力，你将手牌摸至或弃置至已损失体力值，然后本回合你使用同类型的牌额外结算一次。<br>
		阴：你使用牌后，若有角色因此牌受到伤害或回复体力，你失去一点体力并获得此牌，且此牌不计入使用次数。`,

		hyyz_ys_laiyila: ['莱依拉', ["female", "hyyz_ys", 3, ["mengfanqi", "mengmiansi"], []], '绯色愫'],
		mengfanqi: {
			audio: 3,
			init(player) {
				player.storage.mengfanqi = true;
			},
			trigger: {
				player: "phaseDrawBegin2",
			},
			filter(event, player) {
				return !event.numFixed;
			},
			async cost(event, trigger, player) {
				const map = { '一': 1, '二': 2 };
				if (player.storage.mengfanqi) {
					map['三'] = 3;
					map['四'] = 4;
				}
				const list = Object.keys(map);
				const { control } = await player
					.chooseControl(list, 'cancel2', function () {
						return get.cnNumber(_status.event.goon, true);
					})
					.set('goon', player.skipList.includes('phaseUse') ? 4 : (
						player.countCards('h', (card) => get.tag(card, 'damage') && player.hasUseTarget(card)) ? 1 : 4
					))
					.set('prompt', '繁期：多摸至多' + get.translation(list.length) + '张牌')
					.set('prompt2', '不为1，本回合你使用牌时，不能再对其他角色使用牌；<br>为4，下次发动此技至多多摸两张牌')
					.forResult();
				if (control != 'cancel2') {
					event.result = {
						bool: true,
						cost_data: {
							num: map[control],
						}
					}
				}
			},
			async content(event, trigger, player) {
				const num = event.cost_data.num || 1;
				player.storage.mengfanqi = Boolean(num < 4);
				trigger.num += num;
				if (num > 1) player.addTempSkill('mengfanqi_usable', { player: 'phaseUseAfter' });
			},
			subSkill: {
				usable: {
					trigger: {
						player: "useCard1",
					},
					filter(event, player) {
						return player.isPhaseUsing();
					},
					silent: true,
					charlotte: true,
					async content(event, trigger, player) {
						player.addTempSkill('zishou2', { player: 'phaseUseAfter' })
					},
				}
			}
		},
		mengmiansi: {
			audio: 3,
			trigger: {
				player: "phaseDiscardBegin",
			},
			filter(event, player) {
				return !player.isTurnedOver();
			},
			async content(event, trigger, player) {
				await player.turnOver();
				player.addTempSkill('mengmiansi_tag', 'phaseDiscardAfter');
			},
			group: ["mengmiansi_turnover"],
			subSkill: {
				tag: {
					mod: {
						ignoredHandcard(card, player) {
							if (player.hasHistory('gain', evt => evt.cards?.includes(card))) {
								return true;
							}
						},
						cardDiscardable(card, player, name) {
							if (name == 'phaseDiscard' && player.hasHistory('gain', evt => evt.cards?.includes(card))) {
								return false;
							}
						},
					},
				},
				turnover: {
					audio: 'mengmiansi',
					trigger: {
						player: "turnOverEnd",
					},
					filter(event, player) {
						return player.countCards('he') >= 1;
					},
					async cost(event, trigger, player) {
						let dialog = ui.create.dialog('眠思', 'hidden');
						//dialog.addText('若选择出杀，将根据你选择的排序依次使用之')
						var table = document.createElement('div');
						table.classList.add('add-setting');
						table.style.margin = '0';
						table.style.width = '100%';
						table.style.position = 'relative';

						const list = ['出杀', '移牌', '回复'];
						dialog.add([list.map((item, i) => [i, item]), "tdnodes"]);
						dialog.add(player.getCards('he'));

						let next = player.chooseButton();
						next.set('dialog', dialog);
						next.set('selectButton', [2, 4]);
						next.set('ai', () => {
							//console.log(_status.event.dialog.buttons);
							return true;
						})
						next.set('filterButton', function (button, player) {
							if (!player.hasUseTarget({ name: 'sha' }) && button.link == 0) return false;
							if (!player.canMoveCard() && button.link == 1) return false;
							var map = {
								number: 0,
								object: 0,
							};
							if (ui.selected.buttons.length) {
								for (var i = 0; i < ui.selected.buttons.length; i++) {
									map[typeof ui.selected.buttons[i].link]++;
								}
							}
							if (map['object'] == map['number']) return true;
							else {
								if (map['object'] > map['number']) return typeof button.link == 'number';
								if (map['object'] < map['number']) return typeof button.link == 'object';
							}
						});
						next.set('filterOk', (button) => {
							return ui.selected.buttons.filter(buttonx => typeof buttonx.link == 'number').length ==
								ui.selected.buttons.filter(buttonx => typeof buttonx.link == 'object').length
						})
						const { links } = await next.forResult();
						if (links) {
							event.result = {
								bool: true,
								cost_data: {
									dialog: dialog,
									links: links,
								}
							}
						}
					},
					async content(event, trigger, player) {
						const dialog = event.cost_data.dialog, links = event.cost_data.links;
						if (links) {
							dialog.close();
							const cards = links.filter(i => typeof i != 'number');
							const control = links.filter(i => typeof i == 'number');
							await player.discard(cards);
							if (control.includes(0) && player.hasUseTarget({ name: 'sha' })) {//包含杀
								const card = get.autoViewAs({ name: 'sha' }, cards);
								await player.chooseUseTarget(card, cards, true);
							};
							if (control.includes(1)) {
								await player.moveCard(true);
								let map = [];
								while (false && map.length < 3 && game.hasPlayer(current => {
									return current != player && current.countDiscardableCards(player, 'he') && map.filter(k => k == current.name).length < 2;
								})) {
									const { targets: discarder } = await player.chooseTarget('弃置一名其他角色的牌（' + map.length + '/3）', function (card, player, target) {
										if (map.filter(k => k == target.name).length >= 2) return false;
										return target.countDiscardableCards(player, 'he') && target != player;
									})
										.set('ai', (target) => -get.attitude(player, target))
										.forResult();
									if (discarder) {
										map.push(discarder[0].name);
										await player.discardPlayerCard(discarder[0], 'he', true);
									}
								}
							};
							if (control.includes(2)) {
								await player.recover();
								player.draw();
							};
						}
					},
				}
			},
		},
		"mengfanqi_info": "繁期|摸牌阶段，你可以多摸至多四张牌。若你以此法多摸的牌数：不为1，当你于出牌阶段使用牌时，此阶段不能再对其他角色使用牌；为4，下次发动此技至多多摸两张牌。",
		"mengmiansi_info": "眠思|弃牌阶段开始时，你可以将武将牌翻至背面，并令本回合内获得的牌不计入手牌上限。<br>当你翻面后，你可以选择至多两项并弃置等量的牌：<br>1.将弃置的牌当【杀】使用。<br>2.移动场上一张牌。<br>3.回复1点体力并摸一张牌",

		hyyz_ys_aierhaisen: ['艾尔海森', ["male", "hyyz_ys", 4, ["mengtuiyan", "mengrishen"], []], '柚衣'],
		mengtuiyan: {
			audio: 5,
			logAudio: () => [`ext:忽悠宇宙/asset/character/audio/mengtuiyan1.mp3`],
			enable: "phaseUse",
			filterTarget(card, player, target) {
				return player != target && target.countCards('h') > 0;
			},
			async content(event, trigger, player) {
				const target = event.target;
				const { cards } = await target.chooseCard('推演：选择一张手牌', true)
					.forResult();
				if (!cards) return;
				const CARD = cards[0];
				var list = [
					'此时是否有此牌的合法目标',
					'此牌是否是基本牌',
					'此牌的颜色'
				];
				for (var i = 0; i < list.length; i++) {
					list[i] = [i, list[i]];
				}
				let next = target.chooseButton([
					'赐福：选择两种描述方式',
					[list.slice(0, 1), 'tdnodes'],
					[list.slice(1, 2), 'tdnodes'],
					[list.slice(2, 3), 'tdnodes'],
				]);
				next.set('forced', true);
				next.set('selectButton', 2);
				next.set('filterButton', () => true);
				const { links } = await next.forResult()
				if (links) {
					let str = '这是一张';
					if (links.includes(0)) {
						str += `[${target.hasUseTarget(CARD) ? '' : '不'}能使用的]`;
					}
					if (links.includes(2)) {
						str += `[${get.translation(get.color(CARD))}]`;
					}
					if (links.includes(1)) {
						str += `[${get.type(CARD) == 'basic' ? '' : '非'}基本]`;
					}
					str += '牌';
					target.say(str);
					game.log(target, '说', str);

					const { cards } = await player
						.choosePlayerCard(target, true, 'h', 'visible')
						.set('prompt', '猜猜看他说的是那张牌？')
						.set('ai', (card) => {
							if (Math.random() > 0.3) return CARD;
							return true;
						})
						.forResult();
					if (cards) {
						if (cards[0] == CARD) target.showCards(cards);
						else target.showCards([CARD, cards[0]]);
						game.log(player, '选择了', cards);
						if (cards[0] == CARD) {
							game.hyyzSkillAudio('mengtuiyan', 2, 3)
							player.say('如我所料');
							await player.draw(target.countCards('h'));
							player.tempBanSkill(event.name)
						} else {
							game.hyyzSkillAudio('mengtuiyan', 4, 5)
							player.say('计划有变');
							await player.loseHp();
							await player.gain(CARD, target, 'give');
						}
					}
				}
			},
			ai: {
				order: 15,
				result: {
					player(player, target) {
						var num = target.countCards('he');
						if (player.hp <= 1) return (1 - num) * 10 + 1;
						return 3 - num;
					},
					target: -1,
				},
				threaten: 2,
			},
		},
		mengrishen: {
			audio: 4,
			logAudio(event, player) {
				if (event.name == 'useCard') return [
					'ext:忽悠宇宙/asset/character/audio/mengrishen3.mp3',
					'ext:忽悠宇宙/asset/character/audio/mengrishen4.mp3',
				];
				return [
					'ext:忽悠宇宙/asset/character/audio/mengrishen1.mp3',
					'ext:忽悠宇宙/asset/character/audio/mengrishen2.mp3',
				];
			},
			trigger: {
				player: ["gainAfter", "useCard1"],
				global: "loseAsyncAfter",
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'useCard') {
					return player.hasHistory('lose', evt => {
						if (event != evt.getParent()) return false;
						for (var i in evt.gaintag_map) {
							if (evt.gaintag_map[i][0].indexOf('visible_') != -1) return true;
						}
						return false;
					});
				}
				else {
					var evt = event.getParent('phaseDraw');
					if (evt && evt.player == player) return false;
					return event.getg(player).length > 0;
				}
			},
			async content(event, trigger, player) {
				if (trigger.name == 'useCard') {
					game.log(trigger.card, '不能被响应');
					trigger.directHit.addArray(game.players);
				} else {
					var cards = trigger.getg(player);
					player.addShownCards(cards, 'visible_mengrishen');
				}
			},
		},
		visible_mengrishen: '明',
		"mengtuiyan_info": "推演|出牌阶段，你可以令一名其他角色选择一张手牌并选择两项进行描述：1.此时是否有此牌的合法目标。<br>2.此牌是否是基本牌。<br>3.此牌的颜色。<br>你观看并选择该角色的一张手牌，若你与其选择的手牌相同，摸X张牌（X为其的手牌数）且不能再发动此技；否则，你失去1点体力并获得其选择的牌。",
		"mengrishen_info": "日神|锁定技，你于摸牌阶段外获得的牌明置；你使用明置的牌时，其他角色不可响应之。",

		hyyz_b3_xier: ['希儿·芙乐艾', ["female", "hyyz_b3", 4, ["mengshuanghun", "mengsisheng"], []], '沧海依酥', ''],
		mengshuanghun: {
			audio: 2,
			logAudio: () => false,
			init(player) {
				lib.character['hyyz_b3_white_xier'] = ["female", "hyyz_b3", 4, ["mengbaizhou", "mengmingguang"], ['ext:忽悠宇宙/asset/character/image/hyyz_b3_white_xier.jpg', 'die:ext:忽悠宇宙/asset/character/audio:true']];
				lib.character['hyyz_b3_black_xier'] = ["female", "hyyz_b3", 4, ["mengheiye", "menganying"], ['ext:忽悠宇宙/asset/character/image/hyyz_b3_black_xier.jpg', 'die:ext:忽悠宇宙/asset/character/audio:true']];
			},
			trigger: {
				global: ["phaseBefore"],
				player: "enterGame",
			},
			filter(event, player) {
				return (event.name != 'phase' || game.phaseNumber == 0);
			},
			async cost(event, trigger, player) {
				const { links } = await player
					.chooseButton(true, ['双魂：选择一个人格', [['hyyz_b3_white_xier', 'hyyz_b3_black_xier'], 'character']])
					.forResult();
				if (links) event.result = {
					bool: true,
					cost_data: {
						links: links,
					}
				}
			},
			async content(event, trigger, player) {
				const name = event.cost_data.links[0];
				player.storage.mengshuanghun = name;
				player.markSkill('mengshuanghun');

				const skills = lib.character[name][3];
				player.addAdditionalSkill('mengshuanghun', skills);
				player.node.avatar.setBackgroundImage('extension/忽悠宇宙/asset/character/image/' + name + '.jpg');
				game.hyyzSkillAudio('mengshuanghun', (name == 'hyyz_b3_white_xier' ? 1 : 2))
			},
			derivation: ['mengbaizhou', 'mengmingguang', 'mengheiye', 'menganying'],
		},
		mengsisheng: {
			audio: 2,
			logAudio: () => false,
			trigger: {
				player: ["phaseZhunbeiBegin", "turnOverEnd"],
			},
			filter(event, player) {
				if (player.hasSkill('mengsisheng_end') || player.hasSkill('mengsisheng_phase')) return false;
				return true;
			},
			content() {
				'step 0'
				if (player.isLinked()) {
					player.link();
				}
				'step 1'
				if (player.isTurnedOver()) {
					player.turnOver();
				}
				'step 2'
				if (player.storage.mengshuanghun && player.storage.mengshuanghun == 'hyyz_b3_white_xier') {
					player.storage.mengshuanghun = 'hyyz_b3_black_xier';
				} else player.storage.mengshuanghun = 'hyyz_b3_white_xier';
				player.syncStorage('mengshuanghun');
				player.markSkill('mengshuanghun');
				player.addTempSkill('mengsisheng_phase', { player: 'phaseBegin' });
				'step 3'
				if (player.storage.mengshuanghun == 'hyyz_b3_white_xier') {
					game.hyyzSkillAudio('mengsisheng', 1)
					player.addAdditionalSkill('mengshuanghun', ['mengbaizhou', 'mengmingguang']);
					player.node.avatar.setBackgroundImage('extension/忽悠宇宙/asset/character/image/hyyz_b3_white_xier.jpg');
				} else {
					game.hyyzSkillAudio('mengsisheng', 2)
					player.addAdditionalSkill('mengshuanghun', ['mengheiye', 'menganying']);
					player.node.avatar.setBackgroundImage('extension/忽悠宇宙/asset/character/image/hyyz_b3_black_xier.jpg');
				}
			},
			subSkill: {
				phase: {
					mark: true,
					intro: {
						content: '死生失效'
					},
					onremove(player, skill) {
						player.addTempSkill('mengsisheng_end');
					},
					charlotte: true,
				},
				end: {
					mark: true,
					intro: {
						content: '死生失效'
					},
				}
			},
			"_priority": 0,
		},
		mengbaizhou: {
			audio: 2,
			enable: "phaseUse",
			usable: 1,
			filterCard: true,
			position: "he",
			selectCard: [1, Infinity],
			check(card) {
				var player = get.owner(card);
				if (get.type(card) == 'trick') return 10;
				if (player.countCards('h') - player.hp - ui.selected.cards.length > 0) {
					return 8 - get.value(card);
				}
				return 4 - get.value(card);
			},
			filterTarget: true,
			content() {
				target.recover();
				target.draw(cards.length);
			},
			ai: {
				expose: 0.2,
				order: 1,
				result: {
					target(player, target, card) {
						if (target.isDamaged()) return ui.selected.cards.length + 3;
						return ui.selected.cards.length
					}
				},
			},
		},
		mengmingguang: {
			audio: 2,
			trigger: {
				global: "recoverAfter",
			},
			usable: 1,
			check(event, player) {
				return get.attitude(player, event.player) > 0;
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.when({
					player: 'damageBegin3'
				}).then(() => {
					let target = game.findPlayer(current => current.hasSkill('mengmingguang'));
					if (target) target.logSkill('mengmingguang', player)
					trigger.num--;
				})
				await player.drawTo(player.maxHp)
			},
		},
		mengheiye: {
			audio: 2,
			trigger: {
				source: "damageSource",
			},
			check(event, player) {
				return get.attitude(player, event.player) < 0;
			},
			filter(event, player) {
				return event.card && get.color(event.card) == 'black' && event.player.isAlive();
			},
			content() {
				'step 0'
				trigger.player.loseHp()
				'step 1'
				if (trigger.player.getDamagedHp() > 0) player.draw(trigger.player.getDamagedHp());
			},
		},
		menganying: {
			audio: 2,
			trigger: {
				global: "loseHpEnd",
			},
			usable: 1,
			check(event, player) {
				return get.attitude(player, event.player) < 0;
			},
			filter(event, player) {
				return event.player.isAlive()
			},
			async content(event, trigger, player) {
				trigger.player.when({
					player: 'damageBegin3'
				}).then(() => {
					let target = game.findPlayer(current => current.hasSkill('menganying'));
					if (target) target.logSkill('menganying', player)
					trigger.num++;
				})

				var num = trigger.player.countCards('h') - trigger.player.hp;
				if (num > 0) await trigger.player.chooseToDiscard('h', true, num)
				else await trigger.player.draw(-num);
			},
		},
		"hyyz_b3_black_xier": "Vollerei",
		"hyyz_b3_white_xier": "Seele",
		"mengshuanghun_info": "双魂|锁定技，游戏开始时，你从两张“人格”牌中选择一张置于武将牌上，你视为拥有武将牌上“人格”牌的所有技能。",
		"mengsisheng_info": "死生|准备阶段，或你翻面后，你可以更换“人格”牌并复原武将牌，然后此技能无效直到你的下个回合结束。",
		"mengbaizhou_info": "白昼|出牌阶段限一次，你可以弃置任意张牌，令一名角色回复1点体力并摸等量的牌。",
		"mengmingguang_info": "明光|每回合限一次，当一名角色回复体力后，你可以令其下次受到的伤害-1，然后你将手牌摸至体力上限。",
		"mengheiye_info": "黑夜|当你使用黑色牌造成伤害后，你可以令目标角色失去1点体力，然后你摸X张牌，X为其已损失的体力值。",
		"menganying_info": "暗影|每回合限一次，当一名角色失去体力后，你可以令其下次受到的伤害+1，然后你令其将手牌摸至/弃置至当前体力值。",

		hyyz_ys_wu_xiaogong: ['宵宫', ["female", "hyyz_ys", 3, ["mengyanshang", "menghuahuo", "mengxiaji"], []], '冷若寒', ''],
		mengyanshang: {
			audio: "mengyanshi",
			mod: {
				targetInRange(card, player, target) {
					if (!card.cards) return;
					for (var i of card.cards) {
						if (player.getHistory('gain', evt => evt && evt.cards && evt.cards.includes(i)).length) return true;
					}
				},
				cardUsable(card, player) {
					if (!card.cards) return;
					for (var i of card.cards) {
						if (player.getHistory('gain', evt => evt && evt.cards && evt.cards.includes(i)).length) return Infinity;
					}
				},
			},
			trigger: {
				player: "useCard",
			},
			filter(event, player) {
				if (get.itemtype(event.cards) != 'cards') return false;
				for (var i of event.cards) {
					if (player.getHistory('gain', evt => evt && evt.cards && evt.cards.includes(i)).length) return true;
				}
				return false;
			},
			forced: true,
			async content(event, trigger, player) { },
		},
		menghuahuo: {
			audio: "mengqingcun",
			init(player) {
				player.storage.menghuahuo = []
			},
			trigger: {
				player: 'useCardAfter'
			},
			filter(event, player) {
				if (!event.card) return false;
				return ['trick', 'basic'].includes(get.type(event.card));
			},
			frequent: true,
			async content(event, trigger, player) {
				var card1 = game.createCard(trigger.card);
				var card2 = game.createCard(trigger.card);
				var cards = [card1, card2];
				player.$throw(cards, 1000);
				game.log('【花火】', player, '将', cards, '加入牌堆');
				game.cardsGotoPile(cards, () => {
					return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
				});
				player.storage.menghuahuo.add(card1);
				player.storage.menghuahuo.add(card2);
				player.markSkill('menghuahuo');
				game.updateRoundNumber();
				game.delayx();
			},
			intro: {
				mark(dialog, content, player) {
					dialog.addAuto(content);
				},
			},
			group: ["menghuahuo_use", "menghuahuo_lose"],
			subSkill: {
				use: {
					audio: 'menghuahuo',
					trigger: {
						global: "useCardToPlayer",
					},
					filter(event, player) {
						return player.storage.menghuahuo && player.storage.menghuahuo.length && event.cards.filter(function (i) {
							return player.storage.menghuahuo.includes(i);
						}).length > 0;
					},
					locked: true,
					async cost(event, trigger, player) { event.result = { bool: true } },
					async content(event, trigger, player) {
						var list = trigger.cards.filter(function (i) {
							return player.storage.menghuahuo.includes(i);
						});
						var cards = [];
						for (var cardx of list) {
							for (var i = 0; i < ui.cardPile.childNodes.length; i++) {
								var card = ui.cardPile.childNodes[i];
								if (card.name == cardx.name) {
									cards.push(card);
								}
							}
						}
						player.$throw(cards, 1000);
						game.log(player, '将', cards, '置入了弃牌堆');
						await game.cardsDiscard(cards);
						game.delayx();
					},
				},
				lose: {
					audio: 'menghuahuo',
					trigger: {
						global: ["loseAfter", "cardsDiscardAfter", "loseAsyncAfter"],
					},
					locked: true,
					filter(event, player) {
						if (event.name.indexOf('lose') == 0) {
							if (event.getlx === false || event.position != ui.discardPile) return false;
						}
						else {
							var evt = event.getParent();
							if (evt.relatedEvent && evt.relatedEvent.name == 'useCard') return false;
						}
						for (var i of event.cards) {
							var owner = false;
							if (event.hs && event.hs.includes(i)) owner = event.player;
							var type = get.type(i, null, owner);
							if ((type == 'basic' || type == 'trick') && player.storage.menghuahuo && player.storage.menghuahuo.includes(i)) return true;
						}
						return false;
					},
					async cost(event, trigger, player) { event.result = { bool: true } },
					async content(event, trigger, player) {
						var num = 0;
						for (var i of trigger.cards) {
							if (player.storage.menghuahuo && player.storage.menghuahuo.includes(i)) num++;
						}
						await player.draw(num);
					},
				}
			},
		},
		mengxiaji: {
			audio: "menghuahuoyouyi",
			unique: true,
			enable: "phaseUse",
			limited: true,
			filter(event, player) {
				return !player.storage.mengxiaji
			},
			skillAnimation: "epic",
			animationColor: "fire",
			content() {
				player.storage.mengxiaji = true;
				game.filterPlayer(function (current) {
					current.addSkill('mengxiaji2');
				});
			},
			mark: true,
			intro: {
				content: "limited",
			},
			init(player, skill) {
				player.storage[skill] = false;
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				}
			}
		},
		mengxiaji2: {
			trigger: {
				player: ['phaseBegin', 'die'],
			},
			forceDie: true,
			silent: true,
			popup: false,
			locked: true,
			forced: true,
			charlotte: true,
			filter(event, player) {
				return player.hasSkill('mengxiaji');
			},
			content() {
				game.filterPlayer(function (current) {
					current.removeSkill('mengxiaji2');
				});
			},
			mod: {
				cardname(card, player, name) {
					if (card) return 'huogong';
				},
			}
		},
		mengyanshang_info: "炎上|锁定技，你使用本回合获得的牌无距离和次数限制。",
		menghuahuo_info: "花火|当你使用基本牌或普通锦囊牌后，你可以将与此牌同名的两张牌加入牌堆并标记为“花火”。当一张“花火”牌被使用后，你弃置牌堆中所有与之同名的牌。当一张“花火”牌不因使用而进入弃牌堆后，你摸一张牌。",
		mengxiaji_info: "夏祭|限定技，出牌阶段，你可以令所有角色的手牌视为【火攻】，直到你的回合开始或死亡。",

		hyyz_ys_sp_wendy: ['温迪', ["male", "hyyz_ys", 3, ["mengliufeng", "menggexian", "mengbaizhan"], ['die:hyyz_ys_wendy']], '微雨'],
		mengliufeng: {
			audio: 3,
			init(player) {
				player.storage.mengliufeng = 0;
			},
			trigger: {
				global: "roundStart",
			},
			filter(event, player) {
				return player.getHandcardLimit() > 0 || game.hasPlayer(current => get.distance(current, player) > 1);
			},
			async cost(event, trigger, player) {
				var list = [];
				if (game.hasPlayer(current => get.distance(current, player) > 1)) list.add('手牌上限+1');
				if (player.getHandcardLimit() > 0) list.add('手牌上限-1');
				const { control } = await player.chooseControl(list)
					.set('ai', () => 0)
					.forResult();
				if (control != 'cancel2') {
					event.result = {
						bool: true,
						cost_data: {
							control: control
						}
					}
				}
			},
			async content(event, trigger, player) {
				if (event.cost_data.control == '手牌上限+1') {
					player.storage.mengliufeng++;
				}
				if (event.cost_data.control == '手牌上限-1') {
					player.storage.mengliufeng--;
				};
				player.markSkill('mengliufeng');
			},
			mod: {
				maxHandcard(player, num) {
					if (player.storage.mengliufeng == 0) return;
					return num + player.storage.mengliufeng;
				},
				globalTo(from, to, distance) {
					if (to.storage.mengliufeng && to.storage.mengliufeng != 0) {
						return distance - to.storage.mengliufeng;
					};
				},
			},
			onremove: true,
			marktext: "流风",
			intro: {
				content(storage, player) {
					if (storage == 0) return '无变化';
					return `手牌上限${storage}，计算与你的距离${storage > 0 ? '-' + storage : '+' + (-storage)}`;
				},
			},
		},
		menggexian: {
			audio: 2,
			trigger: {
				player: "phaseEnd",
			},
			filter(event, player) {
				return game.hasPlayer(current => get.distance(current, player) == 1);
			},
			async content(event, trigger, player) {
				const targets = game.filterPlayer(current => get.distance(current, player) == 1);
				let list = ["phaseZhunbei", "phaseJudge", "phaseDraw", "phaseUse", "phaseDiscard", "phaseJieshu"];
				for (let target of targets) {
					if (!list.length && !target.countCards('he')) continue;
					let cards = undefined;
					if (target.countCards('h')) {
						let bool = list.length ? false : true,
							str = `交给${get.translation(player)}一张牌` + (list.length ? `，或令其执行${get.translation(list[0])}` : ``);
						cards = (await target
							.chooseCard('he', str)
							.set('forced', bool)
							.set('ai', (card) => 8 - get.value(card))
							.forResult()).cards;
					};
					if (cards) {
						await player.gain(cards, target, 'give');
					} else {
						var next = player[list.shift()]();
						event.next.remove(next);
						trigger.next.push(next);
					}
				}
			},
		},
		mengbaizhan: {
			audio: 2,
			trigger: {
				global: 'useCardEnd'
			},
			filter(event, player) {
				let history = game.getGlobalHistory("useCard");
				return player.getHandcardLimit() == history.indexOf(event) + 1;
			},
			forced: true,
			async content(event, trigger, player) {
				await player.gain(trigger.cards.filterInD(), 'gain2');
				if (trigger.player == player) {
					if (player.getStat().card[trigger.card.name] > 0) player.getStat().card[trigger.card.name]--;
				}
			},
			mod: {
				cardUsable(card, player, num) {
					if (game.getGlobalHistory("useCard").length + 1 == player.getHandcardLimit()) return Infinity;
				},
			},
		},
		"mengliufeng_info": "流风|锁定技，每轮开始时，你令手牌上限+1/-1，然后其他角色计算与你的距离-1/+1。",
		"menggexian_info": "歌仙|回合结束后，令所有与你距离为1的其他角色选择一项：交给你一张牌，你执行首个未因此选择的阶段：准备、判定、摸牌、出牌、弃牌、结束。",
		"mengbaizhan_info": "百盏|锁定技，每回合第Y张牌被使用后，你获得之；若来源为你，此牌不计入次数。Y为你的手牌上限。",

		hyyz_ys_abeiduo: ['阿贝多', ["male", "hyyz_ys", 3, ["mengsucheng", "mengchuangsheng", "mengbaie"], []], '微雨', '尾巴已对技能〖塑成〗〖创生〗进行修改，若有其他方案可私信尾巴修改。'],
		mengsucheng: {
			audio: 3,
			init(player) {
				player.storage.mengsucheng = [];
			},
			enable: "phaseUse",
			onremove: true,
			async content(event, trigger, player) {
				var cards = get.cards();
				var content = ['牌堆顶的牌', cards];
				game.log(player, '观看了牌堆顶的牌');
				await player.chooseControl('ok').set('dialog', content);
				ui.cardPile.insertBefore(cards[0], ui.cardPile.firstChild);

				if (!player.getStorage('mengsucheng').includes(get.suit(cards[0]))) {
					player.markAuto('mengsucheng', get.suit(cards[0]));
					player.addTip('mengsucheng', '塑成 ' + player.storage.mengsucheng.map(suit => get.hyyzSuit(suit)).join(''))
					player.when({ global: 'phaseAfter' }).then(() => {
						player.removeTip('mengsucheng')
						player.storage.mengsucheng = [];
					})
				} else {
					player.tempBanSkill('mengsucheng')
					player.removeTip('mengsucheng')
					var list = [];
					for (var i = 0; i < lib.inpile.length; i++) {
						var name = lib.inpile[i];
						if (get.type(name) == 'trick') list.push(['锦囊', '', name]);
					}
					const { links } = await player
						.chooseButton(true, ['选择视为使用的牌', [list, 'vcard'], true])
						.set('ai', function (button) {
							return button.link[2] == 'wuzhong' ? 1 : 0;
						})
						.forResult()
					if (links) {
						const num = player.getStorage('mengsucheng').length;
						const card = { name: links[0][2] };

						if (game.countPlayer((current) => lib.filter.targetEnabled2(card, player, current)) > 0) {
							const { targets } = await player
								.chooseTarget('视为对至多' + num + '名角色使用' + get.translation(card), [1, num], function (card, player, target) {
									return lib.filter.targetEnabled2(_status.event.cardx, player, target)
								})
								.set('ai', function (target) {
									return get.effect(target, _status.event.cardx, player, player)
								})
								.set('cardx', card)
								.forResult()
							if (targets.length > 0) targets.sortBySeat();
							for (var i of targets) {
								await player.useCard(card, i, false);
							}
						}
					}
				}
			},
			ai: {
				order: 9,
				result: {
					player: 1,
				},
			},
		},
		mengchuangsheng: {
			audio: 3,
			trigger: {
				player: ["useCardAfter", "respondEnd"],
			},
			async cost(event, trigger, player) {
				var next = player.chooseButton([
					'创生：猜测牌堆顶的牌的花色',
					[lib.suit.map(i => ['', '', 'lukai_' + i]), 'vcard']
				]);
				next.set('forced', false);
				next.set('selectButton', [1, 1]);
				next.set('filterButton', function (button) {
					return true
				});
				next.set('ai', function (button) {
					if (_status.event.player.hp == 1) return button.link[2].slice(6) == get.suit(_status.pileTop)
					if (_status.event.player.hasSkill('mengsucheng_no')) return 1;
					else if (get.itemtype(_status.pileTop) != 'card') return 1;
				});
				const { links } = await next.forResult()
				if (links) {
					event.result = {
						bool: true,
						cost_data: links
					}
				}
			},
			async content(event, trigger, player) {
				const suitx = event.cost_data[0][2].slice(6);
				var cards = get.cards();
				var suit2 = get.suit(cards[0]);
				if (suitx == suit2) {
					await player.gain(cards, 'gain2');
					if (player.getStat().card[trigger.card.name] > 0) delete player.getStat().card[trigger.card.name];
				} else {
					await player.showCards(cards);
					player.tempBanSkill('mengchuangsheng')
				}
			},
		},
		mengbaie: {
			audio: 2,
			trigger: {
				player: "gainAfter",
			},
			filter(event, player) {
				const suits = [];
				event.getg(player).forEach(card => {
					suits.add(get.suit(card))
				})
				return !player.hasHistory('gain', (evt) => {
					if (event == evt) return;
					return evt.cards.some(i => suits.includes(get.suit(i)))
				}) && (player.storage.temp_ban_mengsucheng || player.storage.temp_ban_mengchuangsheng)
			},
			async cost(event, trigger, player) {
				var list = [];
				if (player.storage.temp_ban_mengsucheng == true) list.push('塑成');
				if (player.storage.temp_ban_mengchuangsheng == true) list.push('创生');
				const { control } = await player.chooseControl(list)
					.set('prompt', '白垩：选择清除的技能记录')
					.forResult()
				if (control) {
					event.result = {
						bool: true,
						cost_data: control
					}
				}
			},
			async content(event, trigger, player) {
				if (event.cost_data == '塑成') {
					player.storage.mengsucheng = [];
					delete player.storage.temp_ban_mengsucheng
				} else if (event.cost_data == '创生') {
					delete player.storage.temp_ban_mengchuangsheng
				};
			},
		},
		"mengsucheng_info": "塑成|出牌阶段，你可以观看牌堆顶的一张牌。若已观看过此花色，本回合不能再发动此技，然后视为对至多X名角色使用一张普通锦囊牌（X为本回合此技的发动次数）。",
		"mengchuangsheng_info": "创生|当你使用或打出牌后，你可以声明一种花色并展示牌堆顶的牌。若牌堆顶的牌与你声明的花色相同，你获得之并令当前使用的牌不计入使用次数；否则，本回合不能再发动此技。",
		"mengbaie_info": "白垩|你每回合首次获得一种花色的牌后，你重置〖塑成〗或〖创生〗并清除记录。",
	},
	2312: {
		hyyz_ɸ_zhaoxing: ['赵信', ["male", "hyyz_ɸ", 4, ["mengdianci", "mengwuwei"], []], '流萤一生推'],
		mengdianci: {
			audio: 2,
			enable: "phaseUse",
			filterCard: true,
			selectCard: -1,
			position: "h",
			filter(event, player) {
				var hs = player.getCards("h");
				if (!hs.length) {
					return false;
				}
				for (var card of hs) {
					var mod2 = game.checkMod(card, player, "unchanged", "cardEnabled2", player);
					if (mod2 === false) {
						return false;
					}
				}
				return event.filterCard(get.autoViewAs({ name: "sha" }, hs));
			},
			check() { return 1 },
			viewAs: {
				name: "sha",
				storage: {
					mengdianci: true,
				},
			},
			onuse(links, player) { },
			mod: {
				targetInRange(card, player, target) {
					if (card.storage && card.storage.mengdianci) {
						if (get.distance(player, target) != 1) return false;
					}
				},
			},
			group: 'mengdianci_buff',
			subSkill: {
				buff: {
					audio: "mengdianci",
					trigger: {
						global: "useCardAfter",
					},
					charlotte: true,
					silent: true,
					filter(event, player) {
						return event.card.storage?.mengdianci && game.hasPlayer2(current => {
							return current.hasHistory('sourceDamage', evt => evt.card == event.card);
						});
					},
					async content(event, trigger, player) {
						for (let card of trigger.cards) {
							switch (get.type2(card)) {
								case 'basic': await player.draw(); break;
								case 'trick': await player.changeHujia(); break;
								case 'equip': {
									if (trigger.targets.some(i => player.canUse({ name: 'sha' }, i, false, false)))
										await player.useCard({ name: 'sha' }, trigger.targets, false);
									break;
								}
							}
						}
					},
				}
			},
			ai: {
				order: 8,
				threaten: 1.14,
				yingbian(card, player, targets, viewer) {
					if (get.attitude(viewer, player) <= 0) return 0;
					var base = 0, hit = false;
					if (get.cardtag(card, 'yingbian_hit')) {
						hit = true;
						if (targets.filter(function (target) {
							return target.hasShan() && get.attitude(viewer, target) < 0 && get.damageEffect(target, player, viewer, get.nature(card)) > 0;
						})) base += 5;
					}
					if (get.cardtag(card, 'yingbian_all')) {
						if (game.hasPlayer(function (current) {
							return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
						})) base += 5;
					}
					if (get.cardtag(card, 'yingbian_damage')) {
						if (targets.filter(function (target) {
							return get.attitude(player, target) < 0 && (hit || !target.mayHaveShan() || player.hasSkillTag('directHit_ai', true, {
								target: target,
								card: card,
							}, true)) && !target.hasSkillTag('filterDamage', null, {
								player: player,
								card: card,
								jiu: true,
							})
						})) base += 5;
					}
					return base;
				},
				canLink(player, target, card) {
					if (!target.isLinked() && !player.hasSkill('wutiesuolian_skill')) return false;
					if (target.mayHaveShan() && !player.hasSkillTag('directHit_ai', true, {
						target: target,
						card: card,
					}, true)) return false;
					if (player.hasSkill('jueqing') || player.hasSkill('gangzhi') || target.hasSkill('gangzhi')) return false;
					return true;
				},
				basic: {
					useful: [5, 3, 1],
					value: [5, 3, 1],
				},
				result: {
					target(player, target, card, isLink) {
						var eff = function () {
							if (!isLink && player.hasSkill('jiu')) {
								if (!target.hasSkillTag('filterDamage', null, {
									player: player,
									card: card,
									jiu: true,
								})) {
									if (get.attitude(player, target) > 0) {
										return -7;
									}
									else {
										return -4;
									}
								}
								return -0.5;
							}
							return -1.5;
						}();
						if (!isLink && target.mayHaveShan() && !player.hasSkillTag('directHit_ai', true, {
							target: target,
							card: card,
						}, true)) return eff / 1.2;
						return eff;
					},
				},
				tag: {
					respond: 1,
					respondShan: 1,
					damage(card) {
						if (game.hasNature(card, 'poison')) return;
						return 1;
					},
					natureDamage(card) {
						if (game.hasNature(card)) return 1;
					},
					fireDamage(card, nature) {
						if (game.hasNature(card, 'fire')) return 1;
					},
					thunderDamage(card, nature) {
						if (game.hasNature(card, 'thunder')) return 1;
					},
					poisonDamage(card, nature) {
						if (game.hasNature(card, 'poison')) return 1;
					},
				},
			},
		},
		mengwuwei: {
			audio: 4,
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			locked: true,
			filter(event, player) {
				return game.hasPlayer(current => current != player && !current.hasSkill('mengwuwei_juedou')) && (event.name != 'phase' || game.phaseNumber == 0);
			},
			async cost(event, trigger, player) {
				let targets = game.filterPlayer(current => current != player && !current.hasSkill('mengwuwei_juedou'))
				event.result = targets.length == 1 ? { bool: true, targets: targets } : (await player
					.chooseTarget('无畏', lib.translate.mengwuwei_info, true, function (card, player, target) {
						return target != player && !target.hasSkill('mengwuwei_juedou');
					})
					.set('ai', function (target) {
						var att = get.attitude(_status.event.player, target);
						if (att > 0) return att + 1;
						if (att == 0) return Math.random();
						return -att;
					})
					.forResult())
			},
			async content(event, trigger, player) {
				let target = event.targets[0];
				target.addSkill('mengwuwei_juedou');
			},
			mod: {
				globalFrom(from, to, distance) {
					if (to.hasSkill('mengwuwei_juedou')) return -Infinity;
				},
			},
			group: "mengwuwei_add",
			subSkill: {
				juedou: {
					mark: true,
					marktext: "🔱",
					intro: {
						content: "赵信的「决斗」目标",
					},
					sub: true,
					"_priority": 0,
				},
				add: {
					audio: 'mengwuwei',
					trigger: {
						source: "damageSource",
						player: "damageEnd",
					},
					forced: true,
					filter(event, player) {
						return event.source && event.source.isAlive();
					},
					async content(event, trigger, player) {
						var target = trigger.source == player ? trigger.player : trigger.source;
						if (target.hasSkill('mengwuwei_juedou')) {
							await player.draw();
						} else {
							game.filterPlayer(function (current) {
								if (current.hasSkill('mengwuwei_juedou')) current.removeSkill('mengwuwei_juedou')
							})
							target.addSkill('mengwuwei_juedou');
						}
					},
				},
			},
			"_priority": 0,
		},
		"mengdianci_info": "电刺|出牌阶段限一次，你可以将所有手牌当【杀】对距离为1的角色使用。若此【杀】造成伤害，你根据其实体牌包含的牌型，每有一张：<br>1.基本牌，你视为对其使用一张【杀】。<br>2.锦囊牌，摸一张牌。<br>3.武器牌，获得1点护甲。",
		"mengwuwei_info": "无畏|锁定技，游戏开始时，你选择一个「决斗」目标且你计算与其的距离为1。当你造成或受到伤害后，若对方为「决斗」目标，你摸一张牌，否则，将「决斗」目标转移给对方。",

		hyyz_xt_wo_danheng: ['丹恒', ["male", "hyyz_xt", 3, ["menggufeng", "mengqinghua"], []], '七夕月', ''],
		menggufeng: {
			audio: 4,
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content(storage, player, skill) {
					var str = '古枫：';
					if (player.storage.menggufeng == true) str += '阴：将X张手牌当等量数值的风【杀】使用，X为上次发动〖古枫〗阳时使用的手牌数。';
					else str += '阳：将一半（向下取整）的手牌当等量数值的【酒】使用。';
					return str;
				},
			},
			lasttrick(player) {
				var name = '';
				var history = player.getAllHistory('useCard', function (evt) {
					var cardx = evt.card;
					var info = lib.card[cardx.name];
					if (cardx.name == 'wuzhong' || cardx.name == 'hyyz_zisu') return true;
					if (!info || info.type != 'trick' || info.notarget || info.selectTarget && info.selectTarget != 1) return false;
					if (get.type2(cardx) == 'trick') return true;
				});
				if (history.length) name = history[history.length - 1].card.name;
				return name;
			},

			enable: "chooseToUse",
			filter(event, player) {
				if (player.storage.menggufeng) return true;//杀
				else return Math.floor(player.countCards('h') / 2) > 0;//酒
			},
			prompt(event, player) {
				var player = _status.event.player;
				if (player.storage.menggufeng) {
					var num = player.storage.menggufeng_num;
					return '古枫杀：将' + num + '张手牌当伤害基数为' + num + '的风【杀】使用';
				} else {
					var num = Math.floor(player.countCards('h') / 2);
					return '古枫酒：将' + num + '张手牌当伤害基数为' + num + '的【酒】使用';
				}
			},
			filterCard: true,
			selectCard() {
				if (_status.event.player.storage.menggufeng) {
					return _status.event.player.storage.menggufeng_num;
				} else return Math.floor(_status.event.player.countCards('h') / 2);
			},
			position: "h",
			viewAs(cards, player) {
				if (player.storage.menggufeng) {
					return {
						name: "sha",
						nature: "hyyz_wind",
						storage: {
							menggufeng_sha: true,
						},
					}
				} else return {
					name: "jiu",
					storage: {
						menggufeng_jiu: true,
					},
				}
			},
			async precontent(event, trigger, player) {
				if (player.storage.menggufeng) {//sha
					game.hyyzSkillAudio('menggufeng', 2)
					player.changeZhuanhuanji('menggufeng');
					player.removeTip('menggufeng')
					//await player.drawTo(10)
					if (player.hasHistory('useCard', (evt) => evt.card.storage.menggufeng_jiu)) {//第三部分
						player.addGaintag(player.getCards('h'), 'menggufeng')
					}
					player
						.when("useCard1")
						.filter(evt => evt.getParent() == event.getParent())
						.step(async (event, trigger, player) => {
							trigger.baseDamage = trigger.cards.length || 1
						});
				} else {
					game.hyyzSkillAudio('menggufeng', 1)
					player.changeZhuanhuanji('menggufeng');
					var num = Math.floor(player.countCards('h') / 2);
					player.storage.menggufeng_num = num;
					player.addTip('menggufeng', '古枫 ' + num)
					//await player.drawTo(10)
					if (player.hasHistory('useCard', (evt) => evt.card.storage.menggufeng_sha)) {//第三部分
						player.addGaintag(player.getCards('h'), 'menggufeng')
					}
				}
			},
			group: ['menggufeng_view'],
			subSkill: {
				view: {
					audio: 'menggufeng',
					logAudio(event, player, triggername, indexedData, costResult) {
						return [
							'ext:忽悠宇宙/asset/character/audio/menggufeng3.mp3',
							'ext:忽悠宇宙/asset/character/audio/menggufeng4.mp3',
						]
					},
					mod: {
						cardname(card, player, name) {
							if (card.hasGaintag('menggufeng') && lib.skill.menggufeng.lasttrick(player)) {
								return lib.skill.menggufeng.lasttrick(player)
							}
						}
					},
					trigger: {
						player: 'useCardBefore'
					},
					forced: true,
					filter(event, player) {
						if (event.card.storage.menggufeng_sha || event.card.storage.menggufeng_jiu) return false
						return event.cards.filter(i => i.hasGaintag('menggufeng')) && lib.skill.menggufeng.lasttrick(player)
					},
					async content(event, trigger, player) {
						const hs = player.getCards('h', card => card.hasGaintag('menggufeng')).concat(trigger.cards)
						trigger.card.cards = hs
						delete trigger.card.isCard
						trigger.cards = hs
					},
				}
			},
		},
		mengqinghua: {
			audio: 2,
			getLastUsed(player, event) {
				var history = player.getAllHistory('useCard');
				var index;
				if (event) index = history.indexOf(event) - 1;
				else index = history.length - 1;
				if (index >= 0) return history[index];
				return false;
			},
			locked: true,
			trigger: {
				player: "useCardAfter",
			},
			filter(event, player) {
				const evtx = lib.skill.mengqinghua.getLastUsed(player, event);
				return (!event.card.isCard && get.itemtype(event.cards) == 'cards') &&
					evtx && (!evtx.card.isCard && get.itemtype(evtx.cards) == 'cards')
			},
			async cost(event, trigger, player) {
				let num = 0;
				const targets = [];
				if (trigger.player.getAllHistory('sourceDamage', function (evt) {
					if (evt.card == trigger.card) {
						targets.add(evt.player);
						game.log(evt.card, '造成过伤害');
						return true;
					}
					return false
				}).length > 0) num++;

				const evtx = lib.skill.mengqinghua.getLastUsed(player, trigger);
				if (trigger.player.getAllHistory('sourceDamage', function (evt) {
					if (evt.card == evtx.card) {
						targets.add(evt.player);
						game.log(evt.card, '造成过伤害');
						return true;
					}
					return false;
				}).length > 0) num++;
				if (num > 0) {
					event.result = {
						bool: true,
						targets: targets,
						cost_data: evtx
					}
				}
			},
			async content(event, trigger, player) {
				const targets = event.targets
				targets.add(player)
				await game.asyncDraw(targets);
				for (let card of [trigger.card, event.cost_data.card]) {
					if (player.getStat().card[card.name]) {
						game.log(card, '不计入使用次数');
						player.getStat().card[card.name]--;
					}
				}
			},
		},
		"menggufeng_info": "古枫|转换技，<br>阳：你可以将X张手牌当数值为X的【酒】使用；<br>阴：你可以将Y张手牌当数值为Y的风【杀】使用。<br>每回合限一次，若你本回合已发动过阴阳两项，你的所有剩余手牌视为一张你上一次使用的单目标锦囊牌。（X为你的手牌数一半且向下取整，Y为你上次发动阳时的X）",
		"mengqinghua_info": "清化|锁定技，当一名角色连续使用两张转化牌后，若其中有一张牌造成过伤害，你与因此受到伤害的角色各摸一张牌且这两张转化牌均不计入使用次数。",

		hyyz_xt_tuopa: ['托帕', ["female", "hyyz_xt", 3, ["mengzhaiquan", "mengshougou", "mengshicha"], []], '柚衣', '尾巴已对技能〖债权〗〖市察〗进行修改，若有其他方案可私信尾巴修改。'],
		mengzhaiquan: {
			audio: 1,
			marktext: "债",
			intro: {
				name: "债权",
				"name2": "债",
				content: "当前有#个“债”",
			},
			trigger: {
				player: ["chooseToRespondBegin", "chooseToUseBegin"],
			},
			filter(event, player) {
				return !player.isPhaseUsing() && game.hasPlayer(current => current.hasMark('mengzhaiquan'));
			},
			async cost(event, trigger, player) {
				const cardNames = lib.inpile.filter(name => trigger.filterCard({ name: name }, player, trigger))
				if (cardNames.length) {
					event.result = await player
						.chooseTarget(get.prompt2('mengzhaiquan'), function (card, player, target) {
							return target.countMark('mengzhaiquan') > 0;
						})
						.set('ai', () => true)
						.forResult();
					event.result.cost_data = cardNames
				}
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				const { cards } = await target
					.chooseCard(function (card) {
						return event.cost_data.includes(card.names)
					})
					.forResult()
				if (cards) {
					await target.give(cards, player);
					target.removeMark('mengzhaiquan', 1);
				} else {
					const num = target.countMark('mengzhaiquan');
					target.removeMark('mengzhaiquan', num);
					await target.damage(num, 'fire');
				}
			},
			hiddenCard(player, name) {
				return game.hasPlayer(current => current.hasMark('mengzhaiquan'))
			},
			ai: {
				combo: "mengzhaiquan",
				save: true,
				fireAttack: true,
				respondSha: true,
				respondShan: true,
				skillTagFilter(player) {
					if (!game.hasPlayer(current => current.hasMark('mengzhaiquan'))) return false
				},
				order: 9,
				result: {
					player(player) {
						if (_status.event.dying) {
							return get.attitude(player, _status.event.dying);
						}
						return 1;
					},
				},
			},
			group: 'mengzhaiquan_mark',
			subSkill: {
				mark: {
					audio: 'mengzhaiquan',
					trigger: {
						global: "gainAfter",
					},
					filter(event, player) {
						return event.player != player && event.source && event.source == player;
					},
					forced: true,
					async content(event, trigger, player) {
						trigger.player.addMark('mengzhaiquan', trigger.cards.length);
					},
				}
			}
		},
		mengshougou: {
			audio: 3,
			trigger: {
				global: 'phaseDrawAfter'
			},
			filter(event, player) {
				return event.player.hasMark('mengzhaiquan');
			},
			forced: true,
			async content(event, trigger, player) {
				const num = Math.min(trigger.player.countCards('h'), trigger.player.countMark('mengzhaiquan'))
				const { cards } = await player.gainPlayerCard(trigger.player, [1, num], 'visible', 'h', true)
					.set('ai', function (button) {
						return get.value(button.link) - 6
					})
					.forResult()
				if (cards?.length) {
					trigger.player.removeMark('mengzhaiquan', cards.length);
				}
			}
		},
		mengshicha: {
			audio: 3,
			enable: "phaseUse",
			usable: 1,
			filterTarget(card, player, target) {
				return target.countCards('h') < target.maxHp;
			},
			async content(event, trigger, player) {
				const target = event.target;
				const num = target.maxHp - target.countCards('h');
				await player.draw(num);
				if (target != player) {
					await player.chooseToGive(target, 'he', num, true)
				}
			},
			ai: {
				order: 1,
				result: {
					target(player, target) {
						return -1
					},
					player: 2
				}
			}
		},
		mengzhaiquan_info: "债权|其他角色获得你的牌后获得等量的“债”。你于出牌阶段外需要使用或打出一张牌时，可令一名有“债”的角色选择一项：1.交给你一张可以响应的牌并移去一枚“债”。2.移去所有“债”并受到等量的火焰伤害。",
		mengshougou_info: "收购|锁定技，有“债”的角色摸牌阶段结束时，你观看其的手牌并获得其中至多与该角色的“债”等量的牌，然后其移去等量的“债”。",
		mengshicha_info: "市察|出牌阶段限一次，你可以选择一名角色。你摸X张牌并交给其等量的牌。X为其的体力上限与手牌数的差。",

		hyyz_xt_aisida: ['艾丝妲', ["female", "hyyz_xt", 3, ["menglisi", "mengshanzhi", "mengchuxin"], []], '日玖阳气冲三关', '尾巴已对技能〖缮治〗进行修改，若有其他方案可私信尾巴修改。'],
		menglisi: {
			audio: 3,
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'gain' && event.player == player) return false;
				var evt = event.getl(player);
				return evt?.cards2.length > 0;
			},
			async content(event, trigger, player) {
				var evt = trigger.getl(player);
				if (evt && evt.cards2 && evt.cards2.length > 0) {
					var num = evt.cards2.length;
					player.addTempSkill('menglisi_buff');
				}
				while (num > 0) {
					num--;
					player.storage.menglisi_buff++;
					if (player.storage.menglisi_buff % 2 == 0) {
						var skills = player.getStockSkills(false, true);
						await player.removeSkills(skills.pop());
					}
				}
			},
		}, menglisi_buff: {
			silent: true,
			charlotte: true,
			init(player) {
				player.storage.menglisi_buff = 0;
			},
			onremove(player) {
				delete player.storage.menglisi_buff;
				player.logSkill('menglisi');
				const skills = player.getStockSkills(true, true).filter(skill => !player.hasSkill(skill))
				player.addSkills(skills)
				player.draw(skills.length)
			},
		},
		mengshanzhi: {
			audio: 2,
			enable: "phaseUse",
			selectCard: 2,
			position: "he",
			filterCard: true,
			filterTarget: true,
			filter(event, player) {
				return lib.card.hyyz_zisu
			},
			check(card) {
				return 6 - get.value(card)
			},
			async content(event, trigger, player) {
				event.targets[0].useCard({ name: 'hyyz_zisu', isCard: true }, event.targets);
			},
			ai: {
				order: 8,
				result: {
					target: 1,
				},
				threaten: 1.5,
			},
		},
		mengchuxin: {
			audio: 2,
			trigger: {
				player: "useCardAfter",
			},
			filter(event, player) {
				let evt = event, type = get.type2(evt.card, false);
				return !player.hasHistory('useCard', evtx => {
					return evtx != evt && get.type2(evtx.card, false) == type;
				}, evt);
			},
			frequent: true,
			async content(event, trigger, player) {
				const result = await player.draw().forResult();
				const { targets } = await player
					.chooseTarget('是否将' + get.translation(result[0]) + '交给其他角色？', lib.filter.notMe)
					.forResult();
				if (targets) {
					await targets[0].gain(result, player, 'give');
				}
			},
		},
		menglisi_info: "璃思|你每失去两张牌，失去武将牌上的最后一个技能。回合结束时，你恢复武将牌上的技能并摸等量的牌。",
		mengshanzhi_info: "缮治|出牌阶段，你可以弃置两张牌，令一名角色视为使用【自塑尘脂】。",
		mengchuxin_info: "雏心|你每回合首次使用一种类别的牌后，摸一张牌，然后可以将此牌交给一名其他角色。",

		hyyz_ys_hutao: ['胡桃', ["female", "hyyz_ys", 3, ["mengxifeng", "mengliaoshi", "mengwansheng"], []], '日玖阳气冲三关'],//
		mengxifeng: {
			audio: '',
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			filter(event, player) {
				var evt = event.getl(player);
				if (!evt || !evt.hs || !evt.hs.length) return false;
				if (event.name == 'lose') {
					for (var i in event.gaintag_map) {
						if (event.gaintag_map[i].includes('mengxifeng_bg')) return true;
					}
					return false;
				}
				return player.hasHistory('lose', function (evt) {
					if (event != evt.getParent()) return false;
					for (var i in evt.gaintag_map) {
						if (evt.gaintag_map[i].includes('mengxifeng_bg')) return true;
					}
					return false;
				});
			},
			forced: true,
			async content(event, trigger, player) {
				'step 0'
				var num = 0;
				if (trigger.name == 'lose') {
					for (var i in trigger.gaintag_map) {
						if (trigger.gaintag_map[i].includes('mengxifeng_bg')) num++;
					}
				}
				else player.getHistory('lose', function (evt) {
					if (trigger != evt.getParent()) return false;
					for (var i in evt.gaintag_map) {
						if (evt.gaintag_map[i].includes('mengxifeng_bg')) num++;
					}
					return false;
				});
				player.draw(num);
			},
			group: ["mengxifeng_init"],
			subSkill: {
				init: {
					audio: 'mengxifeng',
					trigger: {
						global: "phaseBefore",
						player: "enterGame",
					},
					forced: true,
					filter(event, player) {
						return (event.name != 'phase' || game.phaseNumber == 0) && player.countCards('h') > 0;
					},
					async content(event, trigger, player) {
						var hs = player.getCards('h');
						if (hs.length) player.addGaintag(hs, 'mengxifeng_bg');
					},
				},
			},
		},
		mengliaoshi: {
			skillAnimation: true,
			animationColor: "fire",
			juexingji: true,
			unique: true,
			trigger: {
				global: "phaseJieshuBegin",
			},
			filter(event, player) {
				return !player.hasCard(function (card) {
					return card.hasGaintag('mengxifeng_bg');
				}, 'h');
			},
			forced: true,
			async content(event, trigger, player) {
				player.awakenSkill(event.name);
				player.storage[event.name] = true;
				await player.gainMaxHp();
				var cards = player.getCards('hej');
				await player.recast(cards);
				await player.changeSkills(['mengwansheng_rewrite'], ['mengwansheng'])
				game.log(player, '修改了技能', '#g【万生】');
			},
		},
		mengjiu: {
			init(player) {
				player.markSkill('mengjiu');
			},
			charlotte: true,
			locked: true,
			mark: true,
			marktext: "柩",
			intro: {
				markcount: "expansion",
				mark(dialog, content, player) {
					var content = player.getExpansions('mengjiu');
					if (content && content.length) {
						if (player == game.me || player.isUnderControl()) {
							dialog.addAuto(content);
						}
						else {
							return '共有' + get.cnNumber(content.length) + '个“柩”';
						}
					} else return '空柩';
				},
				content(content, player) {
					var content = player.getExpansions('mengjiu');
					if (content && content.length) {
						if (player == game.me || player.isUnderControl()) {
							return get.translation(content);
						}
						return '共有' + get.cnNumber(content.length) + '个“柩”';
					} else return '空柩';
				},
			},
			onremove(player, skill) {
				var cards = player.getExpansions(skill);
				if (cards.length) player.loseToDiscardpile(cards);
			},
		},
		mengwansheng: {
			trigger: {
				global: ["eventNeutralized", "shaMiss"],
			},
			filter(event, player) {
				if (event.type != 'card') return false;
				if (!event.targets || event.targets.length != 1) return false;
				return true;
			},
			forced: true,
			async content(event, trigger, player) {
				await player.addToExpansion(trigger.cards, 'gain2').gaintag.add('mengjiu');
				if (player.getExpansions('mengjiu').length > player.maxHp) await player.chooseToDiscard('he', true);
			},
			group: 'mengjiu',
			derivation: ["mengwansheng_rewrite"],
		},
		mengwansheng_rewrite: {
			group: ['mengwansheng_rewrite_1', 'mengwansheng_rewrite_2', 'mengjiu'],
			subSkill: {
				1: {
					trigger: {
						global: ["eventNeutralized", "shaMiss"],
					},
					filter(event, player) {
						if (event.type != 'card') return false;
						if (!event.targets || event.targets.length != 1) return false;
						if (player.getExpansions('mengjiu').length >= player.maxHp) return false;
						return true;
					},
					forced: true,
					async content(event, trigger, player) {
						player.addToExpansion(trigger.cards, 'gain2').gaintag.add('mengjiu');
					},
				},
				2: {
					trigger: {
						global: 'useCard',
					},
					filter(event, player) {
						if (event.name == 'shan' || event.name == 'wuxie') return false;
						var type = get.type(event.card, false);
						if (type != 'basic' && type != 'trick') return false;
						return player.getExpansions('mengjiu').some(card => get.type2(card) == get.type2(event.card));
					},
					async cost(event, trigger, player) {
						const { links } = await player
							.chooseCardButton('万生：重铸同类型的“柩”令此牌额外结算', player.getExpansions('mengjiu'))
							.set('ai', () => get.attitude(player, trigger.player) > 0)
							.set('filterButton', function (button) {
								var card = button.link;
								var trigger = _status.event.getTrigger();
								return get.type2(card) == get.type2(trigger.card);
							})
							.forResult()
						if (links) {
							event.result = {
								bool: true,
								cost_data: links
							}
						}
					},
					async content(event, trigger, player) {
						await player.loseToDiscardpile(event.cost_data);
						await player.draw();
						trigger.effectCount++;
					}
				},
			}
		},
		mengxifeng_info: "希逢|锁定技，你将初始手牌标记为“逢”。你失去一张“逢”后，摸一张牌。",
		mengxifeng_bg: "逢",
		mengliaoshi_info: "了逝|觉醒技，每回合结束阶段，若你没有“逢”，你加一点体力上限并重铸区域内所有牌，然后修改“万生”。",
		mengwansheng_info: "万生|锁定技，一张单体牌被抵消后，你将此牌置于武将牌上，称为“柩”。若“柩”数大于你的体力上限，你弃一张牌。",
		mengjiu: "柩",
		mengwansheng_rewrite_info: "万生|①一张单体牌被抵消后，且“柩”数小于你的体力上限，你将此牌置于武将牌上，称为“柩”。②一张基本牌或普通锦囊牌被使用时，你可将一张同类型的“柩”置入弃牌堆并摸一张牌，令此牌额外结算一次。",
	},
}, dynamicTranslates = {
	//罗刹
	hyyzzanghua(player) {
		if (player.storage.hyyzzanghua) return `转换技：<br>
			阳：一名角色受到伤害后，若其的体力值小于一半，其${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。<br>
			<span class="bluetext">阴：一名角色造成伤害后，若其的体力值大于一半，其${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。</span>`;
		return `转换技：<br>
			<span class="bluetext">阳：一名角色受到伤害后，若其的体力值小于一半，其${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。</span><br>
			阴：一名角色造成伤害后，若其的体力值大于一半，其${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。`;
	},
	//彦卿
	mengjiaoqi(player) {
		if (player.storage.mengduanao) return '摸牌阶段结束时，你可以将任意手牌当无距离限制的【杀】使用。此【杀】造成伤害后，你<span class="greentext">回复</span>1点体力并将手牌摸至唯一最多。'
		return '摸牌阶段结束时，你可以将任意手牌当无距离限制的【杀】使用。此【杀】造成伤害后，你<span class="firetext">失去</span>1点体力并将手牌摸至唯一最多。'
	},
	//静流
	hyyzfeiguang(player) {
		const bool = player.storage.hyyzfeiguang;
		let yang = "每回合限一次，你可以将一张牌当不计次数的冰【杀】使用或打出",
			yin = "你受到伤害后须弃置所有黑色手牌，然后获得四张与弃置牌颜色不同的基本牌";
		if (bool) {
			yin = `<span class='bluetext'>${yin}</span>`;
		} else {
			yang = `<span class='firetext'>${yang}</span>`;
		}
		let start = "转换技，",
			end = "。";
		return `${start}阳：${yang}；阴：${yin}${end}`;
	},
	hyyzzhuanpo(player) {
		const bool = player.storage.hyyzzhuanpo;
		let 阳 = "你使用【杀】指定目标后，可以对自己或曾对其造成过伤害的角色造成1点伤害并令此【杀】不可被响应",
			阴 = "你发动〖飞光〗时不消耗手牌";
		if (bool) {
			阴 = `<span class='bluetext'>${阴}</span>`;
		} else {
			阳 = `<span class='firetext'>${阳}</span>`;
		}
		let start = "转换技，",
			end = "。";
		return `${start}阳：${阳}；阴：${阴}${end}`;
	},
	//叶莲娜
	mengdonghen(player) {
		const bool = player.storage.mengdonghen;
		let 前言 = '转换技，当你成为其他角色使用牌的目标后，',
			阳 = "令此牌对你无效",
			阴 = "你失去1点体力并获得此牌",
			后语 = '。'
		if (bool) {
			阴 = `<span class='bluetext'>${阴}</span>`;
		} else {
			阳 = `<span class='firetext'>${阳}</span>`;
		}
		return `${前言}阳：${阳}；阴：${阴}${后语}`;
	},
	//塞西莉亚
	mengxieheng(player) {
		const bool1 = player.storage.mengxieheng_1;
		let 阳1 = "你使用【杀】时1",
			阴1 = "你使用【桃】时1"
		if (bool1) {
			阴1 = `<span class='bluetext'>${阴1}</span>`;
		} else {
			阳1 = `<span class='firetext'>${阳1}</span>`;
		}
		const bool2 = player.storage.mengxieheng_2;
		let 阳2 = "你使用牌时2，若目标包含其他角色，将其他角色移出目标",
			阴2 = "你使用牌时2，若目标包含自己，将自己移出目标"
		if (bool2) {
			阴2 = `<span class='bluetext'>${阴2}</span>`;
		} else {
			阳2 = `<span class='firetext'>${阳2}</span>`;
		}
		const bool3 = player.storage.mengxieheng_3;
		let 阳3 = "你使用牌后，若没有角色因此牌受到伤害或回复体力，你将手牌摸至或弃置至已损失体力值，然后本回合你使用同类型的牌额外结算一次",
			阴3 = "你使用牌后，若有角色因此牌受到伤害或回复体力，你失去一点体力并获得此牌，且此牌不计入使用次数"
		if (bool3) {
			阴3 = `<span class='bluetext'>${阴3}</span>`;
		} else {
			阳3 = `<span class='firetext'>${阳3}</span>`;
		}
		return `锁定技。<br>
		转换技，阳：${阳1}；<br>阴：${阴1}，令所有角色加入此牌目标。<br>
		转换技，阳：${阳2}；阴：${阴2}。<br>
		转换技，阳：${阳3}；<br>
		阴：${阴3}。`
	},
	//琪亚娜
	mengyuehua(player) {
		const list = [
			'1.对一名角色造成1点火焰伤害；<br>',
			'2.回复1点体力；<br>',
			'3.摸一张牌；<br>',
			'4.对一名角色造成1点冰冻伤害；<br>',
			'5.弃置一名角色区域内的一张牌；<br>',
			'6.获得一名其他角色的一张牌；<br>',
			'7.对一名角色造成1点雷电伤害。',
		]
		let strs = []
		const storage = player.getStorage('mengyuehua');
		for (let i = 0; i < 7; i++) {
			if (storage[i] != undefined) {
				if (storage[i][0] == true) strs.add('<span class="bluetext">' + list[i] + '</span>')
				else strs.add('<span class="firetext">' + list[i] + '</span>')
			} else {
				strs.add('<s>' + list[i] + '</s>')
			}
		}
		return `当你执行以下一项后，你可以选择一项执行（每回合每项只能触发和执行一次）：<br>${strs.join('')}`
	},
};
export { characters, dynamicTranslates }