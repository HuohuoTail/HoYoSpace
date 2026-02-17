import { lib, game, ui, get, ai, _status } from '../../noname.js';
export const hyyzBuffx = async function () {//————————————————————————————//
	if ('hyyzBuff，感谢 寰宇星城《玄武江湖》系统原型') {
		/**翻译 */
		for (let [name, translate] of lib.hyyz.buff) if (!lib.translate[name]) lib.translate[name] = translate[0];

		Object.assign(lib.skill, {
			//[效果]内容
			hyyzBuff: {
				charlotte: true,
				locked: true,
				subSkill: {
					//buff
					jiasu: {
						charlotte: true,
						name: '加速',
						mark: true,
						marktext: "⏩",
						intro: {
							name: "加速",
							content: "buff，下个弃牌阶段开始前，插入一个出牌阶段。",
						},
					},
					//debuff
					zhongshang: {
						charlotte: true,
						name: "重伤",
						mark: true,
						marktext: "🔺",
						intro: {
							name: "重伤",
							content: "debuff，下次受到的伤害+1。",
						},
					},
					xuruo: {
						charlotte: true,
						name: "虚弱",
						mark: true,
						marktext: "🔻",
						intro: {
							name: "虚弱",
							content: "debuff，下次造成的伤害-1。",
						},
					},
					jiansu: {
						charlotte: true,
						name: "减速",
						mark: true,
						marktext: "⏪",
						intro: {
							name: "减速",
							content: "debuff，下个出牌阶段开始前，插入一个弃牌阶段。",
						},
					},
					dongjie: {
						charlotte: true,
						name: "冻结",
						init(player) {
							player.$hyyzBuff_dongjie(true);
						},
						onremove(player) {
							player.$hyyzBuff_dongjie(false);
						},
						mark: true,
						marktext: "❄",
						intro: {
							name: "冻结",
							content: "debuff，当前回合内不能使用、打出或弃置手牌。",
						},
					},
					jingu: {
						charlotte: true,
						name: "禁锢",
						mark: true,
						marktext: "🎇",
						intro: {
							name: "禁锢",
							content: "debuff，使用的下一张牌无效。",
						},
					},
					jiuchan: {
						charlotte: true,
						name: "纠缠",
						mark: true,
						marktext: "➿",
						intro: {
							name: "纠缠",
							content: "debuff，下次成为即时牌的目标后，重铸一张相同类型的牌，否则此牌结算两次。",
						},
					},
					//dotdebuff
					lieshang: {
						charlotte: true,
						name: "裂伤",
						mark: true,
						marktext: "🤕",
						intro: {
							name: "裂伤",
							content: `dotdebuff，每层令此角色使用牌指定其他角色后<span style="color:#f40cf0">失去1点体力</span>。`,
						},
						async bang(player) {
							await player.loseHp(1, 'nosource')
								.set('dotDebuff', 'hyyzBuff_lieshang');
						},
					},
					zhuoshao: {
						charlotte: true,
						name: "灼烧",
						mark: true,
						marktext: "🔥",
						intro: {
							name: "灼烧",
							content: `dotdebuff，每层令当前回合结束时此角色<span style="color:#f40cf0">[点燃]区域内随机两张牌（优先手牌）</span>。`,
						},
						async bang(player) {
							if (!player.storage._hyyz_fireCard) player.storage._hyyz_fireCard = [];
							let cards = [];
							let count = 2;
							const hs = player.getCards('h', (card) => !player.storage._hyyz_fireCard.includes(card));
							if (hs.length > count) {
								cards.addArray(hs.randomGets(count))
							} else {
								cards.addArray(hs);
								count -= hs.length;

								const ejs = player.getCards('ej', (card) => !player.storage._hyyz_fireCard.includes(card));
								if (ejs.length > count) {
									cards.addArray(ejs.randomGets(count))
								} else {
									cards.addArray(ejs);
									count -= ejs.length;
									if (count > 0) {
										game.log('所有牌均被', '#r[点燃]', `（有${count}张未执行）`);
									}
								}
							}
							if (cards.length) {
								player.addGaintag(cards, '_hyyz_fireCard');
								player.markAuto('_hyyz_fireCard', cards);
							}
							await game.delayx()
						},
					},
					fenghua: {
						charlotte: true,
						name: "风化",
						mark: true,
						marktext: "🌀",
						intro: {
							name: "风化",
							content: `dotdebuff，准备阶段，每层使此角色<span style="color:#f40cf0">受到1点无来源风蚀伤害</span>。`,
						},
						async bang(player) {
							await player.damage(1, 'hyyz_wind', 'nosource')
								.set('dotDebuff', 'hyyzBuff_fenghua');;
						},
					},
					chudian: {
						charlotte: true,
						name: "触电",
						mark: true,
						marktext: "⚡",
						intro: {
							name: "触电",
							content: `dotdebuff，始终横置；每层使此角色使用或打出无目标的牌后<span style="color:#f40cf0">受到1点雷电伤害</span>。`,
						},
						async bang(player) {
							await player.damage(1, 'thunder', 'nosource')
								.set('dotDebuff', 'hyyzBuff_chudian');;
						},
					},
				}
			},
			//效果执行lastDo: true,priority: -Infinity,
			_hyyzBuff: {
				ai: {
					effect: {
						player(card, player, target) {//使用者
							if (player.hashyyzBuff('hyyzBuff_xuruo') && get.tag(card, "damage")) {
								if (player.hasSkillTag("jueqing", false, target)) return [1, 0];//目标，+，使用者，+
								return 0.2;
							};
							if (player.hashyyzBuff('hyyzBuff_lieshang') && target != player) return [1, player.hp - 2.5];
							if (player.hashyyzBuff('hyyzBuff_jingu')) return [1, -0.5]
							if (player.hashyyzBuff('hyyzBuff_chudian') && target == undefined) return [1, player.hp - 2];
						},
						target(card, player, target) {
							if (target.hashyyzBuff('hyyzBuff_zhongshang') && get.tag(card, "damage")) {
								if (player.hasSkillTag("jueqing", false, target)) return [1, 0];//目标，+，使用者，+
								return [1, -2];
							};

							if (target.hashyyzBuff('hyyzBuff_dongjie')) return [1, -1]
							if (target.hashyyzBuff('hyyzBuff_jiuchan')) return 1.8
						}
					}
				},
				subSkill: {
					jiasu: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							player: "phaseChange",
						},
						filter(event, player) {
							if (!player.hashyyzBuff('hyyzBuff_jiasu')) return false;
							return event.phaseList[event.num].startsWith('phaseDiscard');
						},
						async content(event, trigger, player) {
							game.log(player, '#r[加速]');
							trigger.phaseList.splice(trigger.num, 0, trigger.phaseList[trigger.num]);
							trigger.phaseList[trigger.num] = "phaseUse|hyyzBuff_jiasu";
							await player.removehyyzBuff('hyyzBuff_jiasu');
						},
					},
					zhongshang: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							player: "damageBegin4",
						},
						filter(event, player) {
							return player.hashyyzBuff('hyyzBuff_zhongshang');
						},
						async content(event, trigger, player) {
							game.log(player, '因', '#r[重伤]', '伤害+1');
							trigger.num++;
							await player.removehyyzBuff('hyyzBuff_zhongshang');
						},
						ai: {
							threaten: 4,
						},
					},
					xuruo: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							source: "damageBegin4",
						},
						filter(event, player) {
							return player.hashyyzBuff('hyyzBuff_xuruo');
						},
						async content(event, trigger, player) {
							game.log(player, '因', '#r[虚弱]', '伤害-1');
							trigger.num--;
							await player.removehyyzBuff('hyyzBuff_xuruo');
						},
					},
					jiansu: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							player: "phaseChange",
						},
						filter(event, player) {
							if (!player.hashyyzBuff('hyyzBuff_jiansu')) return false;
							return event.phaseList[event.num].startsWith('phaseUse');
						},
						async content(event, trigger, player) {
							game.log(player, '#r[减速]');
							trigger.phaseList.splice(trigger.num, 0, trigger.phaseList[trigger.num]);
							trigger.phaseList[trigger.num] = "phaseDiscard|hyyzBuff_jiansu";
							await player.removehyyzBuff('hyyzBuff_jiansu');
						},
					},
					jingu: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							player: "useCard",
						},
						filter(event, player) {
							return player.hashyyzBuff('hyyzBuff_jingu')
						},
						async content(event, trigger, player) {
							game.log(player, '因', '#r[禁锢]', trigger.card, '无效')
							trigger.all_excluded = true;
							trigger.targets.length = 0;
							await player.removehyyzBuff('hyyzBuff_jingu')
						},
					},
					jiuchan: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							target: 'useCardToTargeted',
						},
						filter(event, player) {
							if (!player.hashyyzBuff('hyyzBuff_jiuchan')) return false;
							return get.timetype(event.card) == 'notime';
						},
						async content(event, trigger, player) {
							const { cards } = await player
								.chooseCard(`纠缠：重铸一张${get.translation(get.type2(trigger.card))}牌，否则${get.translation(trigger.card)}结算两次`, function (card) {
									return get.type2(card) == _status.event.typex;
								})
								.set('typex', get.type2(trigger.card))
								.set('ai', (card) => 8 - get.value(card))
								.forResult();
							if (cards) {
								game.log(trigger.player, '通过', '#r[纠缠]', '令', player, '重铸了', cards);
								player.recast(cards)
							} else {
								game.log(trigger.player, '因', '#r[纠缠]', '致', trigger.card, '结算两次');
								trigger.getParent().effectCount++;
							}
							await player.removehyyzBuff('hyyzBuff_jiuchan', 1);
						},
					},
					dongjie: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							global: ["phaseAfter"],
						},
						filter(event, player) {
							return player.hashyyzBuff('hyyzBuff_dongjie');
						},
						async content(event, trigger, player) {
							game.log(player, '的', '#r[冻结]', '解除');
							await player.removehyyzBuff('hyyzBuff_dongjie');
						},
						mod: {
							cardEnabled2(card, player) {
								if (player.hashyyzBuff('hyyzBuff_dongjie') && get.position(card) == 'h') return false;
							},
							cardDiscardable(card, player) {
								if (get.position(card) == 'h' && player.hashyyzBuff('hyyzBuff_dongjie')) return false;
							},
						},
					},
					zhuoshao: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							player: "addhyyzBuffAfter",
						},
						filter(event, player) {
							return event.addBuff?.hyyzBuff_zhuoshao > 0 && player.hashyyzBuff('hyyzBuff_zhuoshao') && lib.skill['hyyzBuff_zhuoshao'].bang;
						},
						async content(event, trigger, player) {
							game.log(player, '触发', '#r[灼烧]');
							let num = player.counthyyzBuff(event.name.slice(1));
							while (num > 0) {
								num--;
								await lib.skill[event.name.slice(1)].bang(player);
								await player.removehyyzBuff(event.name.slice(1), 1);
							}
						},
					},
					lieshang: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							player: "useCardToPlayered",
						},
						filter(event, player) {
							return player.hashyyzBuff('hyyzBuff_lieshang') && event.target != player && lib.skill['hyyzBuff_lieshang'].bang;
						},
						async content(event, trigger, player) {
							game.log(player, '触发', '#r[裂伤]');
							await player.removehyyzBuff(event.name.slice(1), 1);
							await lib.skill[event.name.slice(1)].bang(player);
						},
						ai: {
						}
					},
					fenghua: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							player: "phaseZhunbeiBegin",
						},
						filter(event, player) {
							return player.hashyyzBuff('hyyzBuff_fenghua') && lib.skill['hyyzBuff_fenghua'].bang;
						},
						async content(event, trigger, player) {
							game.log(player, '触发' + player.counthyyzBuff(event.name.slice(1)) + '层', '#r[风化]');
							while (player.counthyyzBuff(event.name.slice(1)) > 0) {
								await player.removehyyzBuff(event.name.slice(1), 1);
								await lib.skill[event.name.slice(1)].bang(player);
							}
						},
					},
					chudian: {
						forced: true,
						lastDo: true,
						priority: -Infinity,
						trigger: {
							player: ["useCardAfter", "respond", "linkBefore", "addhyyzBuffAfter"]
						},
						filter(event, player) {
							if (!player.hashyyzBuff('hyyzBuff_chudian')) return false;
							if (!lib.skill['hyyzBuff_chudian'].bang) return false;
							switch (event.name) {
								case 'useCard': return !event.targets || !event.targets.length;
								case 'respond': return true;
								case 'changehyyzBuff': return event.addBuff?.hyyzBuff_chudian > 0 && player.hashyyzBuff('hyyzBuff_chudian');
								default: return player.isLinked();
							};
						},
						async content(event, trigger, player) {
							switch (trigger.name) {
								case 'useCard':
								case 'respond': {
									game.log(player, '触发', '#r[触电]');
									await player.removehyyzBuff(event.name.slice(1), 1);
									await lib.skill[event.name.slice(1)].bang(player);
									break;
								}
								case 'changehyyzBuff': await player.link(true); break;
								default: {
									game.log('#r[触电]', player, '始终横置');
									trigger.cancel();
									break;
								}
							};
						},
					},
				}
			}
		})
		/**获取一组严格类型的buff         严格模式下，dot是单独的类型
		 * @param {hyyzType} arg 严格的buff类型
		 * @returns {hyyzBuff[]}
		 * @example
		 * get.hyyzBuff()//所有buff
		 * get.hyyzBuff('dotdebuff')//只有灼烧、触电等dotdebuff
		 * get.hyyzBuff('dotdebuff','debuff')//所有dotdebuff+debuff
		 */
		get.hyyzBuff = function () {
			const hyyztypes = [];
			for (let argument of arguments) {
				if (['buff', 'debuff', 'dotdebuff'].includes(argument)) {
					hyyztypes.add(argument)
				}
			}
			if (hyyztypes.length) {
				return get.hyyzBuff().filter(buff => hyyztypes.includes(get.hyyztype(buff, true)))
			}
			return Array.from(lib.hyyz.buff.keys());
		}
		//详细buff类型（buff名，严格模式） return 
		/**获取一个buff的buff类型
		 * @param {hyyzBuff?} buff buff名
		 * @param {boolean?} dot 分离dotdebuff？默认false（即二者均返回debuff）
		 * @returns {'debuff'|'buff'|'dotdebuff'|undefined}
		 * @example
		 * get.hyyztype('hyyzBuff_jiasu')//'buff'
		 * get.hyyztype('hyyzBuff_chudian')//'debuff'
		 * get.hyyztype('hyyzBuff_chudian',true)//'dotdebuff'
		 */
		get.hyyztype = function (buff, dot = false) {//默认不严格，也就dot和debuff混在一起，不存在dot类型
			if (!lib.hyyz.buff.has(buff)) return undefined;//未知buff
			const type = lib.hyyz.buff.get(buff)[1];
			if (['debuff', 'dotdebuff'].includes(type) && !dot) return 'debuff';
			return type;
		}
		/**获取一个buff名或一组buff名对应的属性 字符串
		 * @param {hyyzBuff|hyyzBuff[]} buff buff名
		 * @returns {string|''}
		 * @example
		 * get.hyyznature('abc')//''
		 * get.hyyznature('hyyzBuff_chudian')//'thunder'
		 * get.hyyznature(['hyyzBuff_chudian'])//'thunder'
		 * get.hyyznature('hyyzBuff_chudian','hyyzBuff_fenghua')//'thunder|hyyz_wind'
		 */
		get.hyyznature = function (...arg) {
			return get.hyyznatureList(...arg).join(lib.natureSeparator);
		}
		/**获取一个buff名或一组buff名对应的属性 组
		 * @param {hyyzBuff|hyyzBuff[]} buff buff名或buff组
		 * @returns {string[]}
		 * @example
		 * get.hyyznatureList('abc')//[]
		 * get.hyyznatureList('hyyzBuff_chudian')//['thunder']
		 * get.hyyznatureList(['hyyzBuff_chudian'])//['thunder']
		 * get.hyyznatureList('hyyzBuff_chudian','hyyzBuff_fenghua')//['thunder','hyyz_wind']
		 */
		get.hyyznatureList = function () {
			const map = {
				'hyyzBuff_jingu': 'hyyz_imaginary',
				'hyyzBuff_jiuchan': 'hyyz_quantum',
				'hyyzBuff_dongjie': 'ice',
				'hyyzBuff_zhuoshao': 'fire',
				'hyyzBuff_chudian': 'thunder',
				'hyyzBuff_fenghua': 'hyyz_wind',
			}, buffs = [];
			for (let argument of arguments) {
				if (typeof argument == 'string') {
					if (map[argument] != undefined) buffs.add(argument)
				} else if (Array.isArray(argument)) {
					buffs.addArray(argument.filter(buff => lib.hyyz.buff.has(buff) && map[buff] != undefined))
				}
			}
			return buffs.map(buff => map[buff]);
		}
		/**获取一个人的所有buff存有情况
		 * @param {hyyzType}type 输入类型
		 * @param {Boolean}dot 是否严格模式，默认false。若为true，debuff和dotdebuff视为不同类型
		 * @param {Boolean}isNum 是否输出具体层数，默认为true（非dot默认1层）
		 * @returns {Map<hyyzBuff, Number | Boolean>}
		 * @example
		 * 返回值类型
		 * player.gethyyzBuff()//所有类型且为{a:2}的形式
		 * player.gethyyzBuff(null,null,false)//所有类型且为{a:true}的形式
		 * 输入类型
		 * player.gethyyzBuff('buff')//buff
		 * player.gethyyzBuff('debuff')//debuff和dotdebuff
		 * player.gethyyzBuff('debuff',true)//debuff
		 * player.gethyyzBuff('dotdebuff')//dotdebuff
		 */
		lib.element.player.gethyyzBuff = function (type, dot = false, isNum = true) {
			const map = {};
			for (const buff of get.hyyzBuff()) {
				if (get.hyyztype(buff, true) == 'dotdebuff') {
					if (!type || type == 'dotdebuff' || type == 'debuff' && !dot) {
						if (this.countMark(buff) > 0) map[buff] = isNum ? this.countMark(buff) : true;
					}
				} else {
					if (!type || get.hyyztype(buff, true) == type && type == 'buff' || get.hyyztype(buff, dot) == type && type == 'debuff') {
						if (this.hasSkill(buff)) map[buff] = isNum ? 1 : true;
					}
				}
			}
			return map;
		}
		/**拥有buff的数量
		 * @param {hyyzBuff | hyyzType} buff buff名 buff类型 输入类型时用法和{@link gethyyzBuff()}相同
		 * @param {boolean} dot 严格模式，默认false，debuff包含dotdebuff
		 * @returns {Number}
		 * @example 
		 * 输入buff名
		 * player.counthyyzBuff('hyyzBuff_chudian')//1
		 */
		lib.element.player.counthyyzBuff = function (buff, dot = false) {
			//输入了buff名
			if (lib.hyyz.buff.has(buff)) {
				if (get.hyyztype(buff, true) == 'dotdebuff') return this.countMark(buff);
				if (['debuff', 'buff'].includes(get.hyyztype(buff, true)) && this.hasSkill(buff)) return 1;
			}
			//输入了类型
			else if (buff == undefined || ['buff', 'debuff', 'dotdebuff'].includes(buff)) {
				const map = this.gethyyzBuff(buff, dot, true);
				let count = 0;
				for (const buffname in map) {
					if (buff == undefined) count += map[buffname];
					if (buff == 'buff' && get.hyyztype(buffname) == 'buff') count += map[buffname];
					if (buff == 'dotdebuff' && get.hyyztype(buffname, true) == 'dotdebuff') count += map[buffname];
					if (buff == 'debuff' && get.hyyztype(buffname, dot) == 'debuff') count += map[buffname];
				}
				return count;
			}
			return 0;
		}
		//是否拥有buff（buff名|buff类型，严格模式） return boolean
		/**是否拥有buff
		 * @param { hyyzBuff | hyyzType}buff buff名 buff类型 输入类型时用法和{@link gethyyzBuff()}、{@link counthyyzBuff()}相同
		 * @param {Boolean} dot 严格模式，默认false，debuff包含dotdebuff
		 * @returns {Boolean}
		 */
		lib.element.player.hashyyzBuff = function (buff, dot = false) {
			return this.counthyyzBuff(buff, dot) > 0;
		}
		/**获得buff
		 * 所有参数都不是必须的，可以输入任意个buff名|类型，也可以输入对象具体安排层数，但不接受数组
		 * @param {hyyzBuff | hyyzBuff[] | hyyzType | hyyzType[]} buff buff名 buff类型
		 * @param {Object} addBuff 对象
		 * @returns {GameEventPromise}
		 * @example
		 * player.addhyyzBuff()//获得所有三种类型的buff各1层
		 * player.addhyyzBuff('debuff')//获得所有debuff各1层
		 * player.addhyyzBuff('hyyzBuff_jiasu')//获得加速1层
		 * player.addhyyzBuff('hyyzBuff_chudian')//获得1层触电
		 * player.addhyyzBuff('hyyzBuff_chudian','hyyzBuff_lieshang')//获得1层触电和1层裂伤
		 * player.addhyyzBuff('hyyzBuff_chudian','hyyzBuff_lieshang',{hyyzBuff_chudian:2})//获得2层触电和1层裂伤
		 */
		lib.element.player.addhyyzBuff = function () {
			let buffs = [];
			const addBuff = {};
			for (let argument of arguments) {
				if (typeof argument == 'object') {
					if (!Array.isArray(argument)) Object.assign(addBuff, argument)//对象
				} else if (typeof argument == 'string') {
					if (lib.hyyz.buff.has(argument)) {//名
						buffs.add(argument)
						lib.translate[argument] = lib.translate[argument] ?? lib.hyyz.buff.get(argument)[0];
					}
					else if (['buff', 'debuff', 'dotdebuff'].includes(argument)) {//类型
						buffs.addArray(get.hyyzBuff(argument));
					}
				}
			}
			if (!buffs.length) buffs = get.hyyzBuff();

			buffs.forEach((name) => {
				if (!addBuff[name] > 0) addBuff[name] = 1;
			})
			if (!Object.keys(addBuff).length) return;
			return this.changehyyzBuff(addBuff, {});
		}
		/**移除buff
		 * 所有参数都不是必须的，可以输入任意个buff名|类型，也可以输入对象具体安排层数，但不接受数组
		 * @param  { hyyzBuff | hyyzBuff[] | hyyzType | hyyzType[]} buff buff名 buff类型组
		 * @param {Object} removeBuff 对象
		 * @example
		 * player.removehyyzBuff()//无事发生
		 * player.removehyyzBuff('hyyzBuff_jiasu')//移除加速
		 * player.removehyyzBuff('debuff')//移除所有debuff各一层
		 * player.removehyyzBuff('hyyzBuff_chudian')//移除1层触电
		 * player.removehyyzBuff('hyyzBuff_chudian','hyyzBuff_lieshang')//移除1层触电和1层裂伤
		 * player.removehyyzBuff('hyyzBuff_chudian','hyyzBuff_lieshang',{hyyzBuff_chudian:2})//移除2层触电和1层裂伤
		 */
		lib.element.player.removehyyzBuff = function () {
			let buffs = [];
			const removeBuff = {};
			for (let argument of arguments) {
				if (typeof argument == 'object') {//对象
					if (!Array.isArray(argument)) {
						for (let i in argument) {
							if (this.hashyyzBuff(i)) removeBuff[i] = Math.min(this.counthyyzBuff(i), argument[i])
						}
					}
				} else if (typeof argument == 'string') {//字符串
					if (lib.hyyz.buff.has(argument) && this.hashyyzBuff(argument)) buffs.add(argument)//名
					else if (['buff', 'debuff', 'dotdebuff'].includes(argument) && this.hashyyzBuff(argument, true)) {//类型
						const temp = this.gethyyzBuff(argument, true);
						for (let name in temp) {
							if (!removeBuff[name] > 0) removeBuff[name] = temp[name];
						}
					}
				}
			}
			//有数组
			if (buffs.length > 0) {
				buffs.forEach((name) => {
					if (!removeBuff[name] > 0 && this.hashyyzBuff(name)) removeBuff[name] = 1;
				})
			}
			if (!Object.keys(removeBuff).length) return;
			return this.changehyyzBuff({}, removeBuff);
		}
		/**更改buff
		 * 只接受两个对象，是增加和移除的必经函数
		 * @param {Map<hyyzBuff,number>}addBuff 增加的buff
		 * @param {Map<hyyzBuff,number>}removeBuff 移除的buff
		 * @returns {GameEventPromise}
		 */
		lib.element.player.changehyyzBuff = function (addBuff = {}, removeBuff = {}) {
			if (Array.isArray(addBuff) || typeof addBuff != 'object' || Array.isArray(removeBuff) || typeof removeBuff != 'object') {
				console.warn(`警告：Player[${get.translation(this.name)}(${this.name})].changehyyzBuff的参数错误，应当为对象形式。`);
				return;
			}
			if (lib.config['extension_忽悠宇宙_buff'] != true) {
				game.log('未开启buff系统，无法继续执行！')
				return;
			}
			for (let i in removeBuff) {
				if (!lib.hyyz.buff.has(i)) delete addBuff[i];
			}
			for (let i in removeBuff) {
				if (!lib.hyyz.buff.has(i) || !this.hashyyzBuff(i)) delete removeBuff[i];
			}
			const next = game.createEvent("changehyyzBuff");
			next.player = this;
			//next.forceDie = true;
			next.addBuff = Object.assign({}, addBuff);
			next.removeBuff = Object.assign({}, removeBuff);
			next.setContent("changehyyzBuff");
			return next;
		}
		lib.element.content.changehyyzBuff = async function (event, trigger, player) {
			event.result = {
				bool: true,
				addBuff: event.addBuff,
				addBuffs: [],
				removeBuff: event.removeBuff,
				removeBuffs: [],
				changeBuffs: [],
			}
			if (typeof event.addBuff == 'object' && !Array.isArray(event.addBuff)) {
				//手动触发时机
				await event.trigger("addhyyzBuffBefore");
				await event.trigger("addhyyzBuffBegin");
				for (const buff in event.addBuff) {
					let num = event.addBuff[buff];
					if (typeof num == 'boolean' && num === true) num = 1;
					if (typeof num != 'number') continue;
					if (get.hyyztype(buff, true) == 'dotdebuff') {
						let num2 = Math.min(5 - player.counthyyzBuff(buff), num);
						if (num2 > 0) {
							game.log(player, '被施加', num2, '层', `#r[${lib.translate[buff]}]`);
							player.addMark(buff, num2, false);
							event.result.addBuffs.add(buff)//
							if (player.counthyyzBuff(buff) > 0) player.markSkill(buff);
							else player.unmarkSkill(buff);
						} else {
							game.log(player, '的', `#r[${lib.translate[buff]}]`, '已达上限');
						}
					} else if (['debuff', 'buff'].includes(get.hyyztype(buff, true))) {
						if (player.hashyyzBuff(buff)) {
							game.log(player, '已被施加', `#r[${lib.translate[buff]}]`)
						} else {
							game.log(player, '被施加', `#r[${lib.translate[buff]}]`);
							player.addSkill(buff);
							player.markSkill(buff);
							event.result.addBuffs.add(buff)//
						}
					}
				}
				if (event.result.addBuffs?.length) {
					event.result.changeBuffs.addArray(event.result.addBuffs);
				}
				//手动触发时机
				await event.trigger("addhyyzBuffEnd");
				await event.trigger("addhyyzBuffAfter");
			}
			if (typeof event.removeBuff == 'object' && !Array.isArray(event.removeBuff)) {
				//手动触发时机
				await event.trigger("removeBuffBefore");
				await event.trigger("removeBuffBegin");
				for (const buff in event.removeBuff) {
					let num = event.removeBuff[buff];
					if (typeof num == 'boolean' && num === true) num = 1;
					if (typeof num != 'number') continue;
					if (get.hyyztype(buff, true) == 'dotdebuff') {
						num = Math.min(player.counthyyzBuff(buff), num);
						if (num > 0) {
							game.log(player, '移除了', num, '层', '#r[' + lib.translate[buff] + ']');
							player.removeMark(buff, num, false);
							event.result.removeBuffs.add(buff)//
							if (player.counthyyzBuff(buff) > 0) player.markSkill(buff);
							else player.unmarkSkill(buff);
						} else {
							game.log(player, '没有可移除的', '#r[' + lib.translate[buff] + ']');
						}
					} else if (['debuff', 'buff'].includes(get.hyyztype(buff, true))) {
						if (player.hashyyzBuff(buff)) {
							game.log(player, '移除了', '#r[' + lib.translate[buff] + ']');
							player.removeSkill(buff);
							event.result.removeBuffs.add(buff)//
							player.unmarkSkill(buff);
						} else {
							game.log(player, '没有可移除的', '#r[' + lib.translate[buff] + ']');
						}
					}
				}
				if (event.result.removeBuffs?.length) {
					event.result.changeBuffs.addArray(event.result.removeBuffs);
				}
				//手动触发时机
				await event.trigger("removeBuffEnd");
				await event.trigger("removeBuffAfter");
			}
		}
		/**是否可以净化武将牌
		 * 始终会净化普通debuff
		 * @param {'nolink' | 'noturnover' | 'nojudge' | 'buff' | 'nodot' | 'nofire'} arg no+不检查的项目 | 额外考虑的项目
		 * @returns {Boolean}
		 * - `nolink`: 无视横置
		 * - `noturnover`: 无视翻面
		 * - `nojudge`: 无视判定
		 * - `nodot`: 无视dotbuff
		 * - `nofire`: 无视点燃牌
		 */
		lib.element.player.canhyyzJinghua = function (...args) {
			if (this.isLinked() && !args.includes('nolink')) return true;
			if (this.isTurnedOver() && !args.includes('noturnover')) return true;
			if (this.countCards('j') > 0 && !args.includes('nojudge')) return true;
			if (this.hashyyzBuff('buff') && args.includes('buff')) return true;
			if (this.hashyyzBuff('dotdebuff') && !args.includes('nodot')) return true;
			if (this.storage._hyyz_fireCard?.length > 0 && !args.includes('nofire')) return true;
			if (this.hashyyzBuff('debuff', true)) return true;
			return false;
		}
		/**净化武将牌
		 * @param {'nolink' | 'noturnover' | 'nojudge' | 'buff' | 'nodot' | 'nofire'} arg no+不检查的项目 | 额外考虑的项目
		 * @returns {GameEventPromise}
		 * - `nolink`: 不解除横置
		 * - `noturnover`: 不考虑翻面
		 * - `nojudge`: 不清除判定
		 * - `nodot`: 不清除dotbuff
		 * - `nofire`: 不会清除点燃
		 * @example
		 * player.hyyzJinghua('nolink');//不解除横置
		 */
		lib.element.player.hyyzJinghua = function (...args) {
			if (lib.config['extension_忽悠宇宙_buff'] != true) {
				game.log('未开启buff系统！无法净化！')
				return;
			}
			if (!this.canhyyzJinghua(...args)) {
				game.log(this, '不需要被', '#g[净化]')
				return;
			}
			const next = game.createEvent("hyyzJinghua");
			next.player = this;
			for (let i = 0; i < arguments.length; i++) {
				if (arguments[i] == 'nolink') next.link = false;
				if (arguments[i] == 'noturnover') next.turnover = false;
				if (arguments[i] == 'nojudge') next.judge = false;
				if (arguments[i] == 'nodot') next.dot = false;
				if (arguments[i] == 'nofire') next.fire = false;
			}
			//默认
			if (next.link == undefined) next.link = true;//解除横置
			if (next.turnover == undefined) next.turnover = true;//解除翻面
			if (next.judge == undefined) next.judge = true;//解除判定
			if (next.dot == undefined) next.dot = true;//解除dot
			if (next.fire == undefined) next.fire = true;//清除点燃
			//next.forceDie = true;
			next.setContent("hyyzJinghua");
			return next;
		}
		lib.element.content.hyyzJinghua = async function (event, trigger, player) {
			event.result = {};
			game.log(player, '被', '#g[净化]')
			//净化必须解除debuff
			if (player.hashyyzBuff('debuff', event.dot ? false : true)) {
				event.result.bool = true;
				if (event.dot) event.result.dot = player.gethyyzBuff('dotdebuff', null, true);
				event.result.debuff = player.gethyyzBuff('debuff', event.dot ? false : true, true);
				player.removehyyzBuff(player.gethyyzBuff('debuff', event.dot ? false : true, true));
			}
			if (event.judge) {
				const js = player.getCards('j', function (card) {
					return lib.filter.cardDiscardable(card, player, 'hyyzJinghua');
				});
				if (js.length > 0) {
					event.result.bool = true;
					event.result.judge = js;
					player.loseToDiscardpile(js);
				}
			}
			if (event.turnover && player.isTurnedOver()) {
				event.result.bool = true;
				event.result.turnover = true;
				player.turnOver();
			}
			if (event.link && player.isLinked()) {
				event.result.bool = true;
				event.result.link = true;
				player.link();
			}
			if (event.fire && player.storage._hyyz_fireCard?.length) {
				const cards = player.getStorage('_hyyz_fireCard');
				game.log(player, '熄灭', '了', '#r[点燃]', '的', cards.length, '张牌')
				player.removeGaintag('_hyyz_fireCard');
				player.unmarkAuto('_hyyz_fireCard', cards);
			}
		}
		/**是否可以驱散正面buff
		 */
		lib.element.player.canhyyzQvsan = function () {
			if (this.hashyyzBuff('buff')) return true;
			return false;
		}
		/**驱散正面buff
		 */
		lib.element.player.hyyzQvsan = function () {
			if (lib.config['extension_忽悠宇宙_buff'] != true) {
				game.log('未开启buff系统！无法驱散！')
				return;
			}
			if (!this.canhyyzQvsan()) {
				game.log(this, '不需要被', '#g[驱散]')
				return;
			}
			const next = game.createEvent("hyyzQvsan");
			next.player = this;
			next.setContent("hyyzQvsan");
			return next;
		}
		lib.element.content.hyyzQvsan = async function (event, trigger, player) {
			event.result = {};
			game.log(player, '被', '#g[驱散]')
			if (player.hashyyzBuff('buff')) {
				event.result.bool = true;
				event.result.buff = player.gethyyzBuff('buff', null, true);
				player.removehyyzBuff(player.gethyyzBuff('buff', null, true));
			}
		}
		/**引爆dotdebuff
		 * @param  { boolean | 'dotDebuff' | hyyzBuff | hyyzBuff[] | Map<hyyzBuff,number> | } args 默认全部引爆，不移除dotdebuff
		 * @returns {GameEventPromise}
		 * @example
		 * player.hyyzBang()//全部引爆
		 * player.hyyzBang(true)//引爆的同时移除对应的dotdebuff
		 * player.hyyzBang('dotdebuff')//全部引爆dotdebuff
		 * player.hyyzBang('hyyzBuff_chudian')//引爆触电
		 * player.hyyzBang('hyyzBuff_chudian','hyyzBuff_fenghua')//引爆触电、风化
		 * player.hyyzBang(['hyyzBuff_chudian','hyyzBuff_fenghua'])//引爆触电、风化
		 * player.hyyzBang({'hyyzBuff_chudian':599, 'hyyzBuff_fenghua':0 })//无论层数，只提取名字且仅引爆一层
		 */
		lib.element.player.hyyzBang = function (...args) {
			if (lib.config['extension_忽悠宇宙_buff'] != true) {
				game.log('未开启buff系统！无法引爆！')
				return;
			}
			const next = game.createEvent("hyyzBang");
			next.player = this;
			next.buffs = [];
			for (let i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] == 'string') {
					if (arguments[i] == 'dotdebuff') next.buffs = Object.keys(this.gethyyzBuff('dotdebuff', null, true));
					if (lib.hyyz.buff.has(arguments[i])) next.buffs.add(arguments[i]);
				}
				else if (typeof arguments[i] == 'object') {
					if (Array.isArray(arguments[i])) {
						next.buffs.addArray(arguments[i]);
					} else {
						next.buffs.addArray(Object.keys(arguments[i]));
					}
				}
				else if (typeof arguments[i] == 'boolean') {
					next.clear = true;
				}
			}
			if (!next.clear) next.clear = false;
			if (!args.length) next.buffs = Object.keys(this.gethyyzBuff('dotdebuff'));
			else next.buffs = next.buffs.filter(buff => this.hashyyzBuff(buff, null));
			next.setContent("hyyzBang");
			return next;
		}
		lib.element.content.hyyzBang = async function (event, trigger, player) {
			event.result = {};
			event.buffs = event.buffs.filter(buff => player.hashyyzBuff(buff, null));
			const buffs = event.buffs;
			if (!buffs.length) {
				game.log(player, '没有可被', '#r[引爆]', '的dotdebuff');
				event.finish();
				event.result.bool = false;
				return;
			}
			event.result.hyyzBuffs = []
			for (let buff of buffs) {
				if (!player.isIn() || !player.isAlive()) break;
				const skillBang = lib.skill[buff].bang;
				if (!skillBang) break;
				game.log(player, '引爆了', `#r[${get.translation(buff)}]`)
				await skillBang(player);
				event.result.bool = true;
				event.result.hyyzBuffs.add(buff)
				if (event.clear) {
					event.result.clear = true
					await player.removehyyzBuff(buff, 9999);
				}
			}
		}
		//冻结动画,目标效果是冻结，默认检测hyyzBuff_dongjie
		lib.element.player.$hyyzBuff_dongjie = function (bool) {
			if (!bool) bool = Boolean(this.hasSkill('hyyzBuff_dongjie'));
			if (!this.node.hyyzBuff_dongjie) {
				this.node.hyyzBuff_dongjie = ui.create.div('.hyyzBuff-dongjie', this);
				this.classList.toggle('hyyzBuff_dongjie', false);
			}
			this.classList.toggle('hyyzBuff_dongjie', bool);
			game.broadcast((player, bool) => { player.classList.toggle('hyyzBuff_dongjie', bool) }, this, bool);
			ui.updatem(this);
		}
	}

	if ('weakness，感谢 冰雪雨柔《民间卡牌》的ui动画' && lib.config['extension_忽悠宇宙_weakness']) {//player.hyyz_weakness=[]
		/**翻译 */
		for (let [name, translate] of lib.hyyz.weakness) {
			if (!lib.translate[name]) lib.translate[name] = translate[0];
			lib.translate[name + '_logo'] = `<img style = 'width:21px; vertical-align: middle;' src='${lib.assetURL}extension/忽悠宇宙/other/image/${name}_logo.png'>`;
		}

		Object.assign(get, {
			/**获取弱点数组
			 * @param {Array[]|String|null} out 排除的弱点或数组
			 * @returns {Array[]}
			 */
			weakness(out) {
				const weakness = Array.from(lib.hyyz.weakness.keys());
				if (out) {
					for (let argument of arguments) {
						if (typeof argument == 'string') weakness.remove(argument);
						else if (Array.isArray(argument)) weakness.removeArray(argument);
					}
				}
				return weakness;
			},
			/**获取特定角色的弱点
			 * @param {function|null} filter 从存活角色里面筛选一下
			 * @param {boolean|null} toArray 是否输出弱点数组，默认输出Map对象
			 * @returns {Map[]|array}
			 */
			currentWeakenss(filter = lib.filter.all, toArray = false) {
				let players = [];
				if (typeof filter == 'function') {
					players = game.filterPlayer(filter)
				} else if (typeof filter == 'object') {
					if (get.itemtype(filter) == 'player') {
						players = [filter]
					}
					else if (get.itemtype(filter) == 'players') {
						players = filter;
					}
				}
				const map = new Map(), list = [];
				players.forEach(current => {
					map.set(current, current.getWeakness());
					list.addArray(current.getWeakness());
				})
				return toArray ? list : map;
			},
		})
		/**获取角色的弱点组（lib）
		 * @returns {Array[]}
		 */
		lib.element.player.getWeakness = function () {
			if (!this.hyyz_weakness || !Array.isArray(this.hyyz_weakness)) return [];
			return this.hyyz_weakness.filter(i => lib.hyyz.weakness.has(i));
		};
		/**角色的弱点数目（lib）
		 * @returns {number}
		 */
		lib.element.player.countWeakness = function () {
			return this.getWeakness().length;
		};
		/**是否有弱点
		 * 可以输入任意个弱点或弱点组
		 * @param {string|Array|null} arg 可以检测特定弱点（组）
		 * @returns {boolean}
		 * @example
		 * player.hasWeakness()
		 * player.hasWeakness('ice')
		 * player.hasWeakness('ice','fire')
		 * player.hasWeakness(['ice'])
		 */
		lib.element.player.hasWeakness = function (...arg) {
			let weakness = []
			for (let argument of arguments) {
				if (typeof argument == 'string') weakness.add(argument);
				else if (Array.isArray(argument)) weakness.addArray(argument);
			}
			if (!weakness.length) return this.getWeakness().length > 0;
			return weakness.every(i => this.getWeakness().includes(i));
		};
		/**是否是弱点最多
		 * @param {boolean} only 是否检测唯一性
		 * @returns 
		 */
		lib.element.player.isMaxWeakness = function (only) {
			return game.players.every(current => {
				if (current.isOut() || current == this) return true;
				return only ? current.getWeakness().length < this.getWeakness().length : current.getWeakness().length <= this.getWeakness().length;
			});
		};
		/**是否是弱点最少
		 * @param {boolean} only 是否检测唯一性
		 * @returns 
		 */
		lib.element.player.isMinWeakness = function (only) {
			return game.players.every(current => {
				if (current.isOut() || current == this) return true;
				return only ? current.getWeakness().length > this.getWeakness().length : current.getWeakness().length >= this.getWeakness().length;
			});
		};
		/**暴露弱点
		 * @param {Number} num 至少暴露的数量，仅数组较少时会随机补充至num
		 * @param {weakness[]|weakness} addWeakness 优先保证暴露的弱点
		 * @param {boolean} log 是否log
		 */
		lib.element.player.addWeakness = function (...arg) {
			let num = 1, log = true;
			const addWeakness = [];
			for (let argument of arguments) {
				if (typeof argument == 'number') {
					if (num > 1) num = argument
				} else if (typeof argument == 'string') {
					if (get.weakness().includes(argument)) addWeakness.add(argument);
				} else if (Array.isArray(argument)) {
					addWeakness.addArray(argument.filter(i => get.weakness().includes(i)));
				} else if (typeof argument == 'boolean') {
					log = argument;
				}
			}
			//数组不足则补充之
			if (addWeakness.length < num) {
				//所有数组
				const allList = get.weakness();
				//还没有被暴露的弱点
				const canAddList = allList.filter(name => !addWeakness.includes(name) && !this.hasWeakness(name));
				//将暴露的弱点数
				const needAddNum = Math.min(canAddList.length, num - addWeakness.length);
				addWeakness.addArray(canAddList.randomGets(needAddNum))
			}
			return this.changeWeakness(addWeakness, [], log);
		};
		/**隐藏弱点，数组较少时会补充至num
		 * @param {number} num 至少隐藏的弱点数
		 * @param {Array[]|string} removeWeakness 必须隐藏的弱点数（将排除不存在的弱点，和奇怪的格式）
		 * @param {*} log 是否log+触发击破
		 * @returns 
		 */
		lib.element.player.removeWeakness = function () {
			const allList = this.getWeakness();
			if (!allList.length) return;
			const removeWeakness = [];
			let log = true;
			for (let argument of arguments) {
				if (typeof argument == 'string') {
					if (allList.includes(argument)) removeWeakness.add(argument)
				} else if (Array.isArray(argument)) {
					removeWeakness.addArray(argument.filter(i => allList.includes(i)));
				} else if (typeof argument == 'boolean') {
					log = argument;
				}
			}
			if (!removeWeakness.length) removeWeakness.add(allList.randomGet());
			return this.changeWeakness([], removeWeakness, log);
		};
		/**改变弱点（无序）
		 * @param {weakness[]} addWeakness 暴露的弱点
		 * @param {weakness[]} removeWeakness 隐藏的弱点
		 * @param {Boolean} log log，true的话移除会触发击破debuff
		 * @returns {GameEventPromise}
		 * @example
		 * player.changeWeakness(list)//增加list的弱点
		 * player.changeWeakness(list,array)//增加list的弱点，移除array的弱点
		 */
		lib.element.player.changeWeakness = function (addWeakness, removeWeakness, log = true) {
			if (!Array.isArray(addWeakness) || !Array.isArray(removeWeakness)) {
				console.warn(`警告：Player[${get.translation(this.name)}(${this.name})].changeWeakness的参数错误，应当为数组形式。`);
				return;
			}
			if (lib.config['extension_忽悠宇宙_weakness'] != true) {
				game.log('未开启弱点系统，无法更改弱点！')
				return;
			}
			const next = game.createEvent("changeWeakness");
			next.player = this;
			next.log = log;
			next.addWeakness = addWeakness.filter(i => get.weakness().includes(i) && !this.hasWeakness(i));
			next.removeWeakness = removeWeakness.filter(i => get.weakness().includes(i) && this.hasWeakness(i));
			next.setContent("changeWeakness");
			return next;
		};
		lib.element.content.changeWeakness = async function (event, trigger, player) {
			//初始化
			if (!player.hasWeakness()) player.hyyz_weakness = [];
			event.result = {
				bool: false,
				addWeakness: [],
				removeWeakness: [],
				weakness: [],
			};
			if (event.addWeakness?.length) {
				event.trigger('addWeaknessBefore')
				event.trigger('addWeaknessBegin')
				player.hyyz_weakness.addArray(event.addWeakness);
				event.result.bool = true;
				event.result.addWeakness = event.addWeakness;
				game.log(player, '暴露了', event.addWeakness.map(i => i + '_logo'))
				event.trigger('addWeaknessEnd')
				event.trigger('addWeaknessAfter')
			}
			if (event.removeWeakness?.length) {
				event.trigger('removeWeaknessBefore')
				event.trigger('removeWeaknessBegin')
				player.hyyz_weakness.removeArray(event.removeWeakness);
				event.result.bool = true;
				event.result.removeWeakness = event.removeWeakness;
				if (event.log) {
					game.log(player, '击破了', event.removeWeakness.map(i => i + '_logo'));
					for (let name of event.removeWeakness) {
						if (lib.hyyz.weakness.has(name)) {
							await player.addhyyzBuff(lib.hyyz.weakness.get(name)[1]);
						}
					}
				}
				else game.log(player, '隐藏了', event.removeWeakness.map(i => i + '_logo'))
				event.trigger('removeWeaknessEnd')
				event.trigger('removeWeaknessAfter')
			}
			player.hyyz_weakness = player.hyyz_weakness
				.filter(i => get.weakness().includes(i))
				.sort((a, b) => {
					return get.weakness().indexOf(a) - get.weakness().indexOf(b)
				})
			player.$syncWeakness();
			event.result.weakness = player.hyyz_weakness;
		};
		//刷新一下弱点显示
		lib.element.player.$syncWeakness = function () {
			//如果没有弱点或者未开启，直接清空
			if (!this.hasWeakness() || lib.config["extension_忽悠宇宙_weakness"] != true) {
				game.log(this, '的弱点已被清空')
				this.hyyz_weakness = [];
			}

			if (!this.hyyz_weaknessBox) this.hyyz_weaknessBox = ui.create.div('.hyyz_weakness', this);
			if (!this.hyyz_weaknessLogo) this.hyyz_weaknessLogo = ui.create.div('.hyyz_weakness2', this.hyyz_weaknessBox);
			const weakness = this.getWeakness(),
				/**武将牌的宽度
				 * - 单将是自身宽度
				 * - 双将就是两倍的单将宽
				 * - 120
				 */
				width = this.node.avatar.offsetWidth * (this.name2 ? 2 : 1),
				/**武将牌的高度
				 * 180
				 */
				height = this.node.avatar.offsetHeight,
				/**每个小logo的宽度
				 * - 大概是武将宽度的20%左右
				 * - 24
				 */
				logo_short = 0.2 * width,
				logo_long = weakness.length * 1.02 * logo_short
			//总位置坐标+选项换坐标，往下往右是正
			let ally, allx, map_y, map_x;
			switch (lib.config['extension_忽悠宇宙_weaknessPosition']) {//弱点大致位置
				//横向
				case 'top': if (!map_y) map_y = {
					in: 6,
					on: -(logo_short / 2),//往上一半
					out: -(logo_short + 6),//往上一半+6
				}
				case 'bottom': {
					if (!map_y) map_y = {
						in: height - (logo_short + 6),
						on: height - (logo_short / 2),
						out: height + 6,
					}
					ally = map_y[lib.config['extension_忽悠宇宙_weaknessPosition2']]//弱点内外微调
					allx = (width - logo_long) / 2
					break;
				}
				//纵向
				case 'left': if (!map_x) map_x = {
					in: 6,//右6
					on: -(logo_short / 2),
					out: -(logo_short + 6),
				}
				case 'right': {
					if (!map_x) map_x = {
						in: width - (logo_short + 6),
						on: width - (logo_short / 2),
						out: width + 6,
					}
					ally = (height - logo_long) / 2
					allx = map_x[lib.config['extension_忽悠宇宙_weaknessPosition2']]//弱点内外微调
					break;
				}
			}
			this.hyyz_weaknessBox.style.top = ally + 'px'
			this.hyyz_weaknessBox.style.left = allx + 'px'
			/**确定一下相对武将牌坐标原点的铺开方向
			 * 上下放置，则横向铺开left
			 * 左右放置，则纵向铺开top
			 */
			const center = ['top', 'bottom'].includes(lib.config['extension_忽悠宇宙_weaknessPosition']) ? 'left' : 'top'
			let image = '';
			for (let count = 0; count < weakness.length; count++) {
				//logo距离原点的距离（前x个的宽度+前x+1个间隔）：[]x[]x[]X
				image += `<img style = 'position: absolute; width: ${logo_short}px; ${center}: ${count * logo_short + (count + 1) * 0.02 * logo_short}px;'`
				image += `src= '${lib.assetURL}extension/忽悠宇宙/other/image/${weakness[count]}.png'>`//图片
			}
			this.hyyz_weaknessLogo.innerHTML = image;
			ui.updatem(this);
		};
		//弱点击破-99
		lib.skill._weakness_damage = {
			trigger: {
				player: 'damageBegin4'
			},
			forced: true,
			priority: -Infinity,
			filter(event, player) {
				if (event.dotDebuff) return false;
				return get.natureList(event).length > 0 ?
					get.natureList(event).some(i => player.hasWeakness(i)) :
					player.hasWeakness('hyyz_physical')
			},
			async content(event, trigger, player) {
				if (get.natureList(trigger).length > 0) {
					for (const nature of get.natureList(trigger)) {//属性击破
						if (player.hasWeakness(nature)) await player.removeWeakness(nature);
					}
				} else {
					await player.removeWeakness('hyyz_physical');//物理击破
				}
			},
		}
		//初始弱点firstDo: true,priority: Infinity,
		lib.skill._weakness_init = {
			trigger: { global: ["phaseBefore"], player: "enterGame" },
			forced: true,
			firstDo: true,
			priority: Infinity,
			filter(event, player) {
				if (lib.config['extension_忽悠宇宙_weakness'] != true) return false;
				if (!(event.name != 'phase' || game.phaseNumber == 0)) return false;
				return ['boss', 'identity', 'doudizhu', 'single', 'brawl'].includes(get.mode())
			},
			async content(event, trigger, player) {
				player.addWeakness(get.weakness().randomGets(2))//._triggered = null
			}
		}
	}

	if ('函数封装，代码私用') {
		//忽悠宇宙语音调用
		game.hyyzSkillAudio = function (skillname = '', ...args) {
			game.playAudio('..', 'extension', '忽悠宇宙', 'asset', 'character', 'audio', skillname + (args.length > 0 ? args.randomGet() : ''));
			return arguments
		}
		//检测一个扩展是否开启（未启用）
		game.hyyz_hasExtension = function (str) {
			if (!str || typeof str != 'string') return false;
			if (lib.config && lib.config.extensions) {
				for (var i of lib.config.extensions) {
					if (i.indexOf(str) == 0) {
						if (lib.config['extension_' + i + '_enable']) return true;
					}
				}
			}
			return false;
		}
		//调整手牌至x
		lib.element.player.changeCardTo = function (num) {
			let next = game.createEvent('changeCardTo');
			next.player = this;
			next.num = num;
			next.setContent("changeCardTo");
			return next;
		}
		lib.element.content.changeCardTo = async function (event, trigger, player) {
			let cards = player.getCards('h');
			if (typeof event.num != 'number') {
				event.result = { bool: false }
				return;
			}
			let change = event.num - cards.length;
			if (change == 0) {
				event.result = { bool: false }
				return;
			}
			if (change > 0) {
				const result = await player.draw(change)
					.forResult();
				if (result.length) {
					event.result = {
						bool: true,
						cards: result,
						num: change,
						type: 'draw'
					}
				}
			} else {
				const result = await player
					.chooseToDiscard('须调整牌至' + event.num, 'h', -change, true)
					.forResult();
				if (result.bool) {
					event.result = {
						bool: true,
						cards: result.cards,
						num: change,
						type: 'chooseToDiscard'
					}
				}
			}
		}
		//把num张牌放在牌堆顶/牌堆底（'bottom'）的第No张；返回放置的牌
		//可以放指定的牌为参数//参考赛飞儿
		lib.element.player.chooseCardToPile = function (...args) {
			const next = game.createEvent("chooseCardToPile");
			next.player = this;
			if (args.length == 1 && get.is.object(args[0])) {
				for (const i in args[0][i])
					next[i] = args[0][i]
			} else {
				for (const arg of args) {
					if (get.itemtype(arg) == 'card') {
						if (!next.cards) next.cards = [arg]//如果指定了要放的牌
						next.cards.add(arg)
					} else if (get.itemtype(arg) == 'cards') {
						if (!next.cards) next.cards = arg//如果指定了要放的牌
						next.cards.addArray(arg)
					} else if (typeof arg == "number") {//数字
						next.selectCard = [arg, arg];
					} else if (get.itemtype(arg) == "select") {//两元素数组
						next.selectCard = arg;
					} else if (typeof arg == "boolean") {//锁定
						next.forced = arg;
					} else if (get.itemtype(arg) == "position") {//区域
						next.position = arg;
					} else if (typeof arg == "function") {//条件函数
						if (next.filterCard) {//卡牌》ai
							next.ai = arg;
						} else {
							next.filterCard = arg;
						}
					} else if (typeof arg == "object" && arg) {//对象{type:'basic'}
						next.filterCard = get.filter(arg);
					} else if (typeof arg == "string") {//字符串
						if (arg == 'bottom') next.bottom = true;
						else get.evtprompt(next, arg);
					}
					if (arg === null) {
						console.log(args);
					}
				}
			}
			if (next.filterCard == undefined) {
				next.filterCard = lib.filter.all;
			}
			if (next.selectCard == undefined) {
				next.selectCard = [1, 1];
			}
			if (next.position == undefined) {
				next.position = "h";
			}
			if (next.ai == undefined) {
				next.ai = get.unuseful;
			}
			if (next.No == undefined) {
				next.No = 1;
			}
			if (next.cards == undefined) {//如果指定了要放的牌
				next.cards = []
			}
			next.setContent("chooseCardToPile");
			next._args = args;
			return next;
		}
		lib.element.content.chooseCardToPile = async function (event, trigger, player) {
			event.result = {
				bool: true,
				cards: [],
			};
			let cards = [];
			if (event.cards.length > 0) {
				cards = event.cards;
			} else {
				let str = '';
				if (event.selectCard.length == 2) {
					if (player.countCards(event.position) < event.selectCard[0]) {
						console.log(player, '执行chooseCardToPile时' + event.position + '区域的牌不足' + event.selectCard[0]);
						event.finish();
						return;
					}
					if (event.selectCard[1] == event.selectCard[0]) str = get.strNumber(event.selectCard[0])
					if (event.selectCard[1] > event.selectCard[0])
						str = (
							event.selectCard[0] > 1 ? `${get.strNumber(event.selectCard[0])}至` : '至多'
						) + get.strNumber(event.selectCard[1])
				}
				if (!event.prompt) event.prompt = `将${str}张牌置于牌堆${event.bottom == true ? '底' : '顶'}${event.No == 1 ? '' : '第' + event.No + '张'}（先选择的在上）`;
				const { cards: cardsx } = await player.chooseCard(event.position, event.selectCard, event.filterCard, event.ai, event.forced)
					.set('prompt', event.prompt)
					.set('prompt2', event.prompt2)
					.forResult();
				cards = cardsx
			}
			if (cards) {
				event.result.cards = cards;
				if (cards.some(i => get.owner(i) == player)) await player.lose(cards.filter(i => get.owner(i) == player), ui.cardPile);
				if (event.bottom == true) {
					for (let i = 0; i < cards.length; i++) {
						const card = cards[i];
						card.fix();
						ui.cardPile.insertBefore(card, ui.cardPile.children[ui.cardPile.childNodes.length - event.No + 1])
					}
					game.log(player, "将", cards, "置于了牌堆底", event.No == 1 ? '' : '第' + event.No + '张');
				} else {
					cards.reverse();
					if (cards.some(i => get.owner(i) == player)) await player.lose(cards.filter(i => get.owner(i) == player), ui.cardPile);
					for (let i = 0; i < cards.length; i++) {
						const card = cards[i];
						card.fix();
						ui.cardPile.appendChild(card);
						ui.cardPile.insertBefore(card, ui.cardPile.children[event.No - 1]);
					}
					//在弃牌堆
					//await game.cardsGotoPile(cards, "insert");
					game.log(player, "将", cards, "置于了牌堆顶", event.No == 1 ? '' : '第' + event.No + '张');
				}
			}
		}
		//调整体力值至x//(甲,5)//(甲,5,甲,5)//(甲,乙,5,5)
		game.changeHpTo = function (...args) {
			let currents = args.filter(i => get.itemtype(i) == 'player'),
				hps = args.filter(i => typeof i == 'number');
			const next = game.createEvent('changeHpTo');
			next.currents = currents;
			next.hps = hps;
			next.setContent('changeHpTo')
			return next;
		}
		lib.element.content.changeHpTo = async function (event, trigger, player) {
			let currents = event.currents.slice(0, Math.min(event.currents.length, event.hps.length)),
				hps = event.hps.slice(0, Math.min(event.currents.length, event.hps.length))
			while (currents.length != 0 && hps.length != 0) {
				const current = currents.shift(), hp = hps.shift();
				if (current.hp != hp) {
					game.log('<li>', current, '调整体力', `#r${current.hp}`, '至', current.maxHp < hp ? `#g<s>${hp}</s> ${Math.min(hp, current.maxHp)}` : `#g${hp}`)
					await current.changeHp(hp - current.hp);
				} else {
					game.log('<li>', current, '无须调整体力值');
				}
				if (current.hp <= 0) await current.dying();
			}

		}
		/**获取若干有花色有点数的影
		 * @param {number} count 数量
		 * @returns {cards}
		 */
		get.hyyzYing = function (count) {
			var cards = [];
			if (typeof count != 'number') count = 1;
			while (count--) {
				let card = game.createCard('ying', ['spade', 'heart', 'club', 'diamond'].randomGet(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].randomGet());
				cards.push(card);
			}
			return cards;
		}
		/**获取有图案的花色
		 * @param { Card | String } suit
		 * @param { Player } player
		 */
		get.hyyzSuit = function (suit, player) {
			if (get.itemtype(suit) == 'card') suit = get.suit(suit, player)
			let map = {
				heart: '♥️',
				club: '♣️',
				spade: '♠️',
				diamond: '♦️',
				none: '◈'
			}
			return map[suit]
		}
		lib.translate.notime = "即时"
		lib.translate.time = "延时"
		/**牌的延时/即时类型
		 * @param {card|string} obj 牌
		 * @param {'trick'} method 延时锦囊也算trick
		 * @param {player} player 来源
		 * @returns {'time'|'notime'|undefined}
		 */
		get.timetype = function (obj, method, player) {
			if (['delay', 'equip'].includes(get.type(obj, method, player))) return 'time';
			if (['trick', 'basic'].includes(get.type(obj, method, player))) return 'notime';
			return undefined;
		}
		/**中央区的牌（原来无名杀本身就有啊）
		 * @param { Boolean } boolean 是否只要弃牌堆
		 * @returns {card[]}
		 */
		get.centralCards = function (boolean) {
			if (_status?.discarded?.length > 0) {
				return _status.discarded.filter(card => boolean ? get.position(card, false) == 'd' : true)//get.discarded()
			} else return [];
			var cardx = [];
			game.getGlobalHistory('cardMove', (evt) => {
				if (evt.name == 'lose') evt.position == ui.discardPile && cardx.addArray(evt.cards);
				else evt.name == 'cardsDiscard' && cardx.addArray(evt.cards);
			});
			cardx = cardx.filterInD('d').filter(card => {
				return !get.info(card) || !get.info(card).destroy;
			});
			return cardx;
		}
	}
	if ('尾巴自写的概念，部分机制由《大宝规则集》（萨巴鲁酱整理编写）提供设计支持' && lib.config['extension_忽悠宇宙_baoji']) {
		if ('等待官方转正的自写函数') {//丝柯克
			//进入隐匿
			lib.element.player.hyyzUnseen = async function (noChange) {
				game.log(this, '隐匿');
				const name = this.name || this.name1;//名字
				const skillName = "hyyzUnseen_" + name;//不改变标记
				if (noChange != false) {//不改变体力和上限
					lib.skill[skillName] = {//做个技能记录隐匿前的体力
						charlotte: true,
						mark: true,
						intro: {
							content: "隐匿前体力值",
						},
					};
					lib.translate[skillName] = `${this.hp}/${this.maxHp}`;//技能的翻译
					this.storage[skillName] = {//技能的内容
						hp: this.hp,
						maxHp: this.maxHp,
					};
					this.addTempSkill(skillName, { player: "showCharacterAfter" });//获得这个技能直到亮将
					this.when("showCharacterAfter")//亮将后，把当前记录的恢复。
						.vars({
							hp: this.hp,
							maxHp: this.maxHp,
							skillName: skillName,
						}).then(() => {
							player.hp = hp;
							player.maxHp = maxHp;
							player.update();
							delete player.storage[skillName];
						});
				}
				if (name && lib.character[name]) {//如果有武将的名字
					this.storage.rawHp = this.hp;//默认的参数记录一下
					this.storage.rawMaxHp = this.maxHp;
					this.hp = 1;//变成隐匿1
					this.maxHp = 1;
					this.update();
					let skills = lib.character[name][3];//技能组
					if (this.name2 && lib.character[this.name2]?.[3]) skills.addArray(lib.character[this.name2][3]);
					skills = skills.filter(skill => lib.translate[skill + "_info"]);
					this.removeSkill(skills);//把当前的技能全部移除
					if (!this.hiddenSkills) this.hiddenSkills = [];//初始化隐藏技能
					this.hiddenSkills.addArray(skills);//塞进去
					//手动隐匿
					this.classList.add("unseen");
					if (this.name2) this.classList.add("unseen2");
					this.name = "unknown";

					if (!this.node.name_seat && !_status.video) {
						this.node.name_seat = ui.create.div(".name.name_seat", get.verticalStr(get.translation(this.name)), this);
						this.node.name_seat.dataset.nature = get.groupnature(this.group);
					}
					//默认男性不显示体力
					this.sex = "male";
					this.storage.nohp = true;
					this.node.hp.hide();
					this.update();
				}
				if (noChange != false && document.querySelector(".mark-text.small-text"))
					document.querySelector(".mark-text.small-text").textContent = lib.translate[skillName];
			};
		}
		if ('修改自己回合的阶段') {//骊歌黄泉，希儿流萤
			/**部分武将修改自己回合的阶段
			 * 设置player.hyyz_phaseList=[]后，自动在回合开始前替换
			 */
			lib.skill._hyyz_phaseList = {
				charlotte: true,
				silent: true,
				trigger: {
					player: 'phaseBefore'
				},
				priority: Infinity,
				filter(event, player) {
					return player.hyyz_phaseList && Array.isArray(player.hyyz_phaseList);
				},
				async content(event, trigger, player) {
					game.log('<li>', player, '因技能机制修改了', '#b阶段排布')
					trigger.phaseList = player.hyyz_phaseList;
				},
			}
		}
		if ('获得勾玉') {//骊歌黄泉
			lib.element.player.addGouyu = function () {
				var next = game.createEvent("addGouyu", false);//false不设置时机
				next.player = this;
				next.setContent("addGouyu");
				return next;
			};
			lib.element.content.addGouyu = function () {
				if (lib.config.background_audio) {
					game.playAudio("effect", "recover");
				}
				game.broadcast(function () {
					if (lib.config.background_audio) {
						game.playAudio("effect", "recover");
					}
				});
				game.broadcastAll(function (player) {
					if (lib.config.animation && !lib.config.low_performance) {
						player.$recover();
					}
				}, player);
				player.$damagepop(num, "wood");
				game.log(player, "获得了" + get.cnNumber(1) + "枚勾玉");
				player.maxHp += 1;
				player.changeHp(1, false);
			};
		}
		if ('体力下限') {//player.hyyz_hyyzminHp 尾巴满穗
			//一般人体力下限是1，hp<=0濒死；hp>=1存活
			//也就是说，hp<=player.gethyyzMinHp()-1濒死；
			//hp>=player.gethyyzMinHp()存活
			lib.translate.hyyzminHp = '体力下限';
			lib.skill._hyyzminHp = {
				marktext: '💔',
				intro: {
					name: '体力下限',
					markcount(storage, player) {
						return `${player.gethyyzMinHp()}/${player.hp}/${player.maxHp}`;
					},
					content(storage, player) {
						return `
					<li>体力上限：${player.maxHp}
					<li>当前体力值：${player.hp}
					<li>体力下限：${player.gethyyzMinHp()}
					<br>
					<li>体力下限是存活状态的最小体力，默认为1；低于体力下限时濒死。
					`
					},
				},
				trigger: {
					player: ['dyingBefore', 'changeHp'],
				},
				silent: true,
				priority: -Infinity,
				filter(event, player) {
					if (!player.hashyyzMinHp()) return false;
					player.$synchyyzMinHp();
					if (event.name == 'dying') return player.hp >= player.gethyyzMinHp();//大于下限濒死取消
					return player.hp < player.gethyyzMinHp();//小于下限立即濒死
				},
				async content(event, trigger, player) {
					if (trigger.name == 'dying') trigger.cancel();
					else {
						//自定义一个濒死函数
						if (player.nodying || player.hp > player.gethyyzMinHp() - 1 || player.isDying()) return;//替换this.hp > 0
						const next = game.createEvent("dying");
						next.player = player;
						next.reason = trigger.getParent();
						if (trigger.source) next.source = trigger.source;
						next.setContent(lib.skill._hyyzminHp.dyingContent);//替换'dying'
						next.filterStop = function () {
							if (this.player.hp > this.player.gethyyzMinHp() - 1 || this.nodying) {
								delete this.filterStop;
								return true;
							}
						};
					}
				},
				async dyingContent(event, trigger, player) {
					event.forceDie = true;
					if (player.isDying() || player.hp > player.gethyyzMinHp() - 1) {
						event.finish();
						return;
					}
					_status.dying.unshift(player);
					game.broadcast(function (list) {
						_status.dying = list;
					}, _status.dying);
					game.log(player, "濒死");
					await event.trigger("dying");

					delete event.filterStop;//此处替换  >0
					if (player.hp > player.gethyyzMinHp() - 1 || event.nodying) {
						_status.dying.remove(player);
						game.broadcast(function (list) {
							_status.dying = list;
						}, _status.dying);
						event.finish();
						return;
					} else if (!event.skipTao) {
						const next = game.createEvent("_save");
						var start = false;
						var starts = [_status.currentPhase, event.source, event.player, game.me, game.players[0]];
						for (var i = 0; i < starts.length; i++) {
							if (get.itemtype(starts[i]) == "player") {
								start = starts[i];
								break;
							}
						}
						next.player = start;
						next._trigger = event;
						next.triggername = "_save";
						next.forceDie = true;
						next.setContent("_save");
						await next;//增加异步停顿
					}

					_status.dying.remove(player);
					game.broadcast(function (list) {
						_status.dying = list;
					}, _status.dying);//修改 <=0
					if (player.hp <= player.gethyyzMinHp() - 1 && !event.nodying && !player.nodying) player.die(event.reason);
				},
			}
			/**角色改变自己的体力下限 */
			lib.element.player.changeMinHp = function (num) {
				const next = game.createEvent('changeMinHp')
				next.num = num
				next.player = this
				next.setContent("changeMinHp");
				return next;
			}
			lib.element.content.changeMinHp = async function (event, trigger, player) {
				if (!player.hashyyzMinHp()) player.hyyzminHp = 1//凡是需要用到这个函数的，都初始化minHp
				player.hyyzminHp += event.num;
				player.$synchyyzMinHp();
			}
			/**获取角色的体力下限，总有返回值
			 * - player.hashyyzMinHp()==false时，返回1
			 */
			lib.element.player.gethyyzMinHp = function () { return this.hashyyzMinHp() ? this.hyyzminHp : 1 }
			/**查找角色是否被设置了体力下限 */
			lib.element.player.hashyyzMinHp = function () { return (typeof this.hyyzminHp == 'number') }
			/**刷新一下角色的体力下限标志 */
			lib.element.player.$synchyyzMinHp = function () {
				if (this.gethyyzMinHp() == 1) {
					delete this.hyyzminHp;
					this.unmarkSkill('_hyyzminHp');
				} else {
					this.markSkill('_hyyzminHp');
				}
			}
		}
		if ('点燃机制') {//card.gaintag = ['_hyyz_fireCard'] 柚衣姬子 柚衣宵宫 灵符的净化（只有移除标记）
			lib.translate._hyyz_fireCard = "🔥"
			/**每回合结束后弃置点燃牌 */
			lib.skill._hyyz_fireCard1 = {
				trigger: {
					global: 'phaseAfter'
				},
				lastDo: true,
				silent: true,
				priority: -Infinity,
				async content(event, trigger, player) {
					const players = game.filterPlayer(current => current.countCards('hej', card => card.hasGaintag('_hyyz_fireCard')));
					for (let current of players) {
						const cards = current.getCards('hej', (card) => card.hasGaintag('_hyyz_fireCard'));
						if (cards.length) {
							game.log(current, '#r[点燃]', '的', cards.length, '张牌化为了灰烬');
							await current.discard(cards);
						}
					}
				},
			}
			/**点燃牌无距离无次数限制，不计次数 */
			lib.skill._hyyz_fireCard2 = {
				mod: {
					targetInRange(card, player, target) {
						if (card.cards?.some(i => i.hasGaintag('_hyyz_fireCard'))) return true;
					},
					cardUsable(card, player, target) {
						if (card.cards?.some(i => i.hasGaintag('_hyyz_fireCard'))) return Infinity;
					},
					aiOrder(player, card, num) {
						if (get.itemtype(card) == 'card' && card.hasGaintag('_hyyz_fireCard')) return num + 3;
					},
				},
				trigger: {
					player: "useCard",
				},
				filter(event, player) {
					return get.itemtype(event.cards) == "cards" && player.hasHistory('lose', evt => {
						if (event != evt.getParent()) return false;
						for (let playerid in evt.gaintag_map) {
							if (evt.gaintag_map[playerid].includes('_hyyz_fireCard')) return true;
						}
						return false;
					});
				},
				silent: true,
				priority: -Infinity,
				async content(event, trigger, player) {
					const name = (trigger.card.viewAs || trigger.card.name);
					if (player.getStat().card[name] > 0) {
						player.getStat().card[name]--;
					}
				},
			}
			/**点燃一些牌
			 * @param {Card | Card[] | 'h' | 'e' | 'j' | 's' | 'x'} cards 一个区域/一堆牌/一张牌
			 * @returns {GameEventPromise}
			 */
			lib.element.player.hyyzDianran = function (cards) {
				if (get.itemtype(cards) == 'position') cards = this.getCards(cards);
				if (get.itemtype(cards) == 'cards') cards = cards.filter(card => this.getCards('ehj').includes(card));
				if (get.itemtype(cards) == 'card') cards = [cards].filter(card => this.getCards('ehj').includes(card));
				if (!cards.length) {
					game.log(this, '没有可被', '#r[点燃]', '的牌')
					return;
				}
				const next = game.createEvent("hyyzDianran");
				next.player = this;
				next.cards = cards;
				next.setContent("hyyzDianran");
				return next;
			}
			lib.element.content.hyyzDianran = async function (event, trigger, player) {
				const cards = event.cards;
				event.result = {
					bool: false,
					cards: cards,
					hs: cards.filter(card => player.countCards('h', cardx => cardx == card).length > 0),
					es: cards.filter(card => player.countCards('e', cardx => cardx == card).length > 0),
					js: cards.filter(card => player.countCards('j', cardx => cardx == card).length > 0),
					cards2: cards.filter(card => player.countCards('he', cardx => cardx == card).length > 0),
				};
				game.playAudio('..', 'audio', 'skill', 'zhuque_skill');//朱雀羽扇的
				game.log(player, '#r[点燃]', '了', event.cards.length, '张牌');
				player.addGaintag(cards, '_hyyz_fireCard');
			}
		}
		if ('扩展装备栏') {//player.expandedSlots = object 尾巴纳西妲 测试服
			/**有扩展装备栏 */
			lib.element.player.hasExpandedSlot = function (slot) {
				if (slot == "horse" || slot == "equip3_4") {
					return this.hasExpandedSlot(3) && (get.is.mountCombined() || this.hasExpandedSlot(4));
				} else if (get.is.mountCombined() && slot == "equip4") {
					return false;
				}
				return this.countDisabledSlot(slot) > 0;
			}
			/**返回扩展栏数 */
			lib.element.player.countExpandedSlot = function (slot) {
				let allNum = 0;
				const storage = this.expandedSlots;
				if (!storage) return 0;
				if (slot) {//给定位置
					if (storage[slot]) return storage[slot];
					if (storage['equip' + slot]) return storage['equip' + slot];
				} else {//统计所有
					for (let key in storage) {
						let subNum = storage[key];
						if (typeof subNum == 'number' && subNum > 0) {
							allNum += subNum;
						}
					}
				}
				return allNum;
			}
			/**返回拥有的扩展栏对象{ equip: 1 } */
			lib.element.player.getExpandedSlot = function () {
				const storage = this.expandedSlots;
				if (!storage) return {};
				const keys = Object.keys(storage).sort();
				let map = {}, bool = false;
				for (const key of keys) {//遍历每个部位
					const subNum = storage[key];//该位置的扩展数
					if (typeof subNum == 'number' && subNum > 0) {
						map[key] = subNum;//不写storage[key]，是因为可能是0或者别的什么东西，必须确保为正数
						bool = true;
					}
				}
				if (bool) return map;
				return {};
			}
			/**扩展栏的标记(无用) */
			lib.element.player.getExpandedSlot2 = function () {
				const storage = this.expandedSlots;//{ equip: 1 }
				if (!storage) return '当前没有扩展装备栏';
				const keys = Object.keys(storage).sort(), combined = get.is.mountCombined();
				let str = '';
				for (const key of keys) {//遍历每个部位
					const subNum = storage[key];//该位置的扩展数
					if (typeof subNum == 'number' && subNum > 0) {
						let trans = (combined && key == 'equip3') ? '坐骑' : get.translation(key);//合并坐骑后，34都是3_4，没有3和4，统称坐骑栏。如果意外有3，看成坐骑。此处只是改个名
						str += '<li>' + trans + '栏：' + subNum + '个<br>';
					}
				}
				if (str.length) return str.slice(0, str.length - 4);//去掉最后的<br>
				return '当前没有扩展装备栏';
			}
			/**删除指定位置的扩展栏 */
			lib.element.player.deleteEquip = function () {
				var next = game.createEvent('deleteEquip');
				next.player = this;
				next.slots = [];
				for (var i = 0; i < arguments.length; i++) {
					if (get.itemtype(arguments[i]) == 'player') {
						next.source = arguments[i];
					}
					else if (Array.isArray(arguments[i])) {
						for (var arg of arguments[i]) {
							if (typeof arg == 'string') {
								if (arg.startsWith('equip') && parseInt(arg.slice(5)) > 0) next.slots.push(arg);
							}
							else if (typeof arg == 'number') {
								next.slots.push('equip' + arg);
							}
						}
					}
					else if (typeof arguments[i] == 'string') {
						if (arguments[i].startsWith('equip') && parseInt(arguments[i].slice(5)) > 0) next.slots.push(arguments[i]);
					}
					else if (typeof arguments[i] == 'number') {
						next.slots.push('equip' + arguments[i]);
					}
				}
				if (!next.source) next.source = _status.event.player;
				if (!next.slots.length) {
					_status.event.next.remove(next);
					next.resolve();
				}
				next.setContent('deleteEquip');
				return next;
			}
			lib.element.content.deleteEquip = async function (event, trigger, player) {
				/**执行到后面时，最终需要弃置的牌 */
				const discards = []
				/**要处理的装备栏 */
				const slotsx = [];//合并['equip1','equip3_4']
				if (get.is.mountCombined()) {
					event.slots.forEach(type => {
						if (type == 'equip3' || type == 'equip4') slotsx.add('equip3_4');
						else slotsx.add(type);
					});
				}
				else {
					slotsx.addArray(event.slots);
				}
				slotsx.sort();//合并组['equip1','equip3_4']
				if (!event.slots.length) event.finish()//普通['equip1','equip3']

				//开始删除！['equip1','equip3_4']
				for (const slot of slotsx) {
					let slot_key = slot;//二次存equip1？
					/**已有的扩展栏数 */
					let left = player.expandedSlots[slot],
						/**能废除的装备栏数 */
						lose;
					if (slot == 'equip3_4') {
						//选中，3和4中的最大数，然后再与已有装备栏中取小数
						lose = Math.min(left, Math.max(get.numOf(event.slots, 'equip3'), get.numOf(event.slots, 'equip4')));//相当于，废3则连带4一起废
					} else {
						lose = Math.min(left, get.numOf(event.slots, slot));//普通装备栏，在输入的栏中统计这个栏的数量
					}
					if (lose > 0) {
						game.log(player, '移除了' + get.cnNumber(lose) + '个', '#g扩展' + get.translation(slot) + '栏');
						if (!player.expandedSlots) {//初始化扩展栏
							player.expandedSlots = {};
						}
						player.expandedSlots[slot_key] -= lose;//数据上删除
						if (player.expandedSlots[slot_key] <= 0) delete player.expandedSlots[slot_key];//合法化这个记录
						//接下来处理对应装备栏的牌，如果格子不够了，多余的牌就要丢掉
						let cards = player.getCards("e", card => get.subtypes(card).includes(slot) && !discards.includes(card));//该位置的牌（除了已经统计在内的）
						if (cards.length > 0) {
							const enable = player.countEnabledSlot(slot);//未被废除的装备栏数
							let result;
							if (!enable) {//已经没了？那就全丢掉
								result = { bool: true, links: cards };
							} else if (cards.length > enable) {//位置上的牌比剩余栏多，选择性弃置吧
								/**操作弃置牌的人 */
								const source = event.source?.isIn() ? event.source : player,
									/**需要弃置的牌数 */
									num = (cards.length - enable);
								result = await source
									.chooseButton([
										`选择${player == source ? '你' : get.translation(player)}的${get.cnNumber(num)}张${get.translation(slot)}牌置入弃牌堆`,
										cards
									])
									.set('selectButton', [1, num])
									.set('forced', true)
									.set('filterOk', function () {
										var evt = _status.event;
										return ui.selected.buttons.reduce(function (num, button) {
											if (evt.slot == 'equip3_4') {// 合并栏位：取装备栏3和4子类型的最大值
												return num + Math.max(get.numOf(get.subtypes(button.link, false), 'equip3'), get.numOf(get.subtypes(button.link, false), 'equip4'));
											}
											// 普通栏位：直接统计子类型数量
											return num + get.numOf(get.subtypes(button.link, false), evt.slot);
										}, 0) == evt.required;
									})
									.set('required', num)
									.set('slot', slot)
									.forResult()
							}
							if (result.bool) {
								discards.addArray(result.links);
							}
						}
					} else continue;//废除的数量不够就检测下一个部位
				}
				player.$syncExpand();
				if (!player.countExpandedSlot()) player.unmarkSkill('expandedSlots');
				if (discards.length > 0) player.loseToDiscardpile(discards);
			}
		}
		if ('废除手牌区') {//player.storage._disableHand = boolean 心海
			/**废除手牌区
			 * @param { Player } source 来源，默认当前时机角色
			 */
			lib.element.player.disableHand = function (source) {
				var next = game.createEvent('disableHand');
				next.player = this;
				next.source = source
				if (!next.source) next.source = _status.event.player;
				next.setContent('disableHand');
				return next;
			}
			lib.element.content.disableHand = async function (event, trigger, player) {
				game.log(player, "废除了", "#g手牌区");
				const hs = player.getCards("h")
				if (hs) await player.discard(hs)
				player.storage._disableHand = true
				game.broadcastAll(function (player, card) {
					player.$disableHand();
				}, player);
			}
			/**刷新（无用） */
			lib.element.player.$disableHand = function () { }
			lib.skill._hyyz_disableHand = {
				mark: true,
				marktext: "✋",
				intro: {
					content: "手牌区已废除",
				},
				silent: true,
				priority: null,
				firstDo: true,
				trigger: {
					player: ["gift", "gainBefore"],
				},
				filter(event, player) {
					if (event.name == 'gift') return event.target != player && event.target.storage._disableHand;
					if (!player.storage._disableHand) return false
					if (event.giver == event.player || event.source == event.player) return false;
					return event.getParent(2).name != '_hyyz_disableHand';
				},
				async content(event, trigger, player) {
					if (trigger.getParent(2).name == 'useCard') {
						trigger.getParent(2).targets.remove(player);
						trigger.getParent(2).excluded.add(player);
					};
					if (trigger.name == 'gift') {
						trigger.deniedGift.add(trigger.card);
						trigger.deniedGifts = trigger.cards;
					}
					const cards = trigger.cards;
					if (get.owner(cards[0])) get.owner(cards[0]).discard(cards);
					await game.cardsDiscard(cards);
					if (trigger.name == 'gain' && trigger.getg(player).length) {
						await player.loseToDiscardpile(trigger.cards);
					}
					trigger.cancel();
					if (trigger.bool) trigger.bool = false;
					if (trigger.cards) trigger.cards = [];
					if (trigger.links) trigger.links = [];
					if (trigger.buttons) trigger.buttons = {};
				},
				ai: {
					refuseGifts: true,
				},
			}
			/**角色是否已废除手牌区 */
			lib.element.player.isDisabledHand = function () {
				return this.storage._disableHand
			}
			/**恢复手牌区 */
			lib.element.player.enableHand = function () {
				var next = game.createEvent('enableHand');
				next.player = this;
				for (var i = 0; i < arguments.length; i++) {
					if (get.itemtype(arguments[i]) == 'player') {
						next.source = arguments[i];
					}
				}
				if (!next.source) next.source = _status.event.player;
				next.setContent('enableHand');
				return next;
			}
			lib.element.content.enableHand = async function (event, trigger, player) {
				delete player.storage._disableHand
				game.log(player, "恢复了", "#g手牌区");
			}
		}
		if ('波提欧发起单挑') {//骊歌波提欧
			/**可以发起单挑
			 * 角色超过2，未处于单挑状态（记录了移除的角色）
			 * @returns {boolean}
			 */
			lib.element.player.canDantiao = function () {
				if (game.players.length <= 2) return false;
				if (game.countPlayer() <= 2) return false;
				if (game.dantiao) return false;
				return true;
			}
			/**对一名角色发起单挑
			 * @param {target} target 目标
			 */
			lib.element.player.chooseDantiao = function (target) {
				var next = game.createEvent('chooseDantiao', false);//false不设置时机
				next.player = this;
				next.target = target;
				next.setContent('chooseDantiao');
				return next;
			}
			lib.element.content.chooseDantiao = async function (event, trigger, player) {
				if (event.player == event.target) {
					game.log('不可以伤害自己喵！')
					event.finish();
					return;
				} else {
					const otherPlayers = game.filterPlayer((current) => current != event.player && current != event.target);
					if (otherPlayers.length > 0) {
						game.dantiao = otherPlayers;
						otherPlayers.forEach(current => {
							current.addTempSkill('dantiao');
							current.classList.add('hidden');
							game.players.remove(current);
						});
					} else {
						game.log('这点人还单挑什么喵？直接开干吧！');
						event.finish();
						return;
					}
				}
			}
			lib.skill.dantiao = {//给移除的角色，封印所有非单挑技能
				dantiao: true,
				forceDie: true,
				forced: true,
				charlotte: true,
				init(player, skill) {
					player.addSkillBlocker(skill);
				},
				onremove(player, skill) {
					player.removeSkillBlocker(skill);
				},
				skillBlocker(skill, player) {
					return !lib.skill[skill].dantiao;
				},
				mod: {
					cardDiscardable: () => false,
					cardEnabled: () => false,
					cardEnabled2: () => false,
					cardUsable: () => false,
					cardRespondable: () => false,
					cardSavable: () => false,
				},
			}
			lib.skill._dantiao = {/**有人死亡或者有回合结束，复原所有单挑场景 */
				siodu: true,
				charlotte: true,
				forceDie: true,
				forced: true,
				priority: 888,
				trigger: {
					player: ['dieBegin', 'phaseEnd']
				},
				filter(event, player) {
					if (!game.dantiao) return false;
					return game.dantiao.length > 0 && game.dantiao.length > 0;
				},
				async content(event, trigger, player) {
					game.dantiao.forEach(current => {
						current.removeSkill('dantiao');
						current.classList.remove('hidden');
						game.players.add(current);
					});
					delete game.dantiao;
				}
			}
		}
		if ('进行一次座次排布（未启用）') {
			/**进行一次座次排布（未启用） */
			lib.element.player.chooseToSwapSeat = function () {
				let next = game.createEvent("chooseToSwapSeat", false);//false不设置时机，只能自己加。但是自己加的只能在content里面，不写默认true，可以在运行content之外先触发时机。
				next.player = this;
				next.setContent('chooseToSwapSeat');
				return next;
			}
			lib.element.content.chooseToSwapSeat = async function (event, trigger, player) {
				//while (true) {
				//	const {targets} = await player.chooseTarget("选择两名角色交换位置", 2)
				//				.forResult();
				//	if (!targets) break;
				//	game.swapSeat(targets[0], targets[1], null, null, true);
				//}
				const toSortPlayers = game.filterPlayer();
				toSortPlayers.sortBySeat(game.findPlayer2(current => current.getSeatNum() == 1, true));
				const next = player.chooseToMove("是否分配所有角色的座次？");
				next.set("list", [
					[
						"（以下排列的顺序即为发动技能后角色的座次顺序）",
						[
							toSortPlayers.map(i => `${i.getSeatNum()}|${i.name}`),//['1|甲','2|乙','3|丙']
							function (item, type, position, noclick, node) {
								const info = item.split("|"),
									_item = item;
								const seat = parseInt(info[0]);
								item = info[1];
								if (node) {
									node.classList.add("button");
									node.classList.add("character");
									node.style.display = "";
								} else {
									node = ui.create.div(".button.character", position);
								}
								node._link = item;
								node.link = item;

								const func = function (node, item) {
									const currentPlayer = game.findPlayer(current => current.getSeatNum() == seat);
									if (currentPlayer.classList.contains("unseen_show")) node.setBackground("hidden_image", "character");
									else if (item != "unknown") node.setBackground(item, "character");
									if (node.node) {
										node.node.name.remove();
										node.node.hp.remove();
										node.node.group.remove();
										node.node.intro.remove();
										if (node.node.replaceButton) node.node.replaceButton.remove();
									}
									node.node = {
										name: ui.create.div(".name", node),
										group: ui.create.div(".identity", node),
										intro: ui.create.div(".intro", node),
									};
									const infoitem = [currentPlayer.sex, currentPlayer.group, `${currentPlayer.hp}/${currentPlayer.maxHp}/${currentPlayer.hujia}`];
									node.node.name.innerHTML = get.slimName(item);
									if (lib.config.buttoncharacter_style == "default" || lib.config.buttoncharacter_style == "simple") {
										if (lib.config.buttoncharacter_style == "simple") {
											node.node.group.style.display = "none";
										}
										node.classList.add("newstyle");
										node.node.name.dataset.nature = get.groupnature(get.bordergroup(infoitem));
										node.node.group.dataset.nature = get.groupnature(get.bordergroup(infoitem), "raw");
									}
									node.node.name.style.top = "8px";
									if (node.node.name.querySelectorAll("br").length >= 4) {
										node.node.name.classList.add("long");
										if (lib.config.buttoncharacter_style == "old") {
											node.addEventListener("mouseenter", ui.click.buttonnameenter);
											node.addEventListener("mouseleave", ui.click.buttonnameleave);
										}
									}
									node.node.intro.innerHTML = lib.config.intro;
									if (!noclick) {
										lib.setIntro(node);
									}
									node.node.group.innerHTML = `<div>${get.cnNumber(seat, true)}号</div>`;
									node.node.group.style.backgroundColor = get.translation(`${get.bordergroup(infoitem)}Color`);
								};
								node.refresh = func;
								node.refresh(node, item);

								node.link = _item;
								node.seatNumber = seat;
								node._customintro = uiintro => {
									uiintro.add(`${get.translation(node._link)}(原${get.cnNumber(node.seatNumber, true)}号位)`);
								};
								return node;
							},
						],
					],
				]);
				next.set("toSortPlayers", toSortPlayers.slice(0));
				next.set("processAI", () => {
					const players = get.event("toSortPlayers"),
						player = get.player();
					players.randomSort().sort((a, b) => get.attitude(player, b) - get.attitude(player, a));
					return [players.map(i => `${i.getSeatNum()}|${i.name}`)];
				});
				const { bool, moved } = await next.forResult();
				//moved = ['3|丙', '1|甲', '2|乙']
				if (!bool) return;

				const resultList = moved[0].map(info => parseInt(info.split("|")[0]));//[3, 1, 2]
				const toSwapList = [];
				const cmp = (a, b) => {
					return resultList.indexOf(a) - resultList.indexOf(b);
				};
				for (let i of toSortPlayers) {//冒泡排序
					for (let j of toSortPlayers) {
						if (cmp(i.getSeatNum(), j.getSeatNum()) < 0) {
							toSwapList.push([i, j]);
							[i, j] = [j, i];
						}
					}
				}
				game.broadcastAll(toSwapList => {
					for (const list of toSwapList) {
						game.swapSeat(list[0], list[1], false);
					}
				}, toSwapList);
				await game.delay();
			}
		}
	}
}