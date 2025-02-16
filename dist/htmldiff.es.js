const c = {
  equal: 0,
  delete: 1,
  insert: 2,
  none: 3,
  replace: 4
};
class m {
  constructor(t, e, n) {
    this.startInOld = t, this.startInNew = e, this.size = n;
  }
  get endInOld() {
    return this.startInOld + this.size;
  }
  get endInNew() {
    return this.startInNew + this.size;
  }
}
class C {
  constructor() {
    this.blockSize = 0, this.repeatingWordsAccuracy = 0, this.ignoreWhitespaceDifferences = !1;
  }
}
const S = /^\s*<\/?[^>]+>\s*$/, D = /<[^\s>]+/, A = /^(\s|&nbsp;)+$/, j = /[\w\#@]+/, v = [
  "<img"
];
function I(r) {
  return v.some((t) => r !== null && r.startsWith(t)) ? !1 : S.test(r);
}
function z(r) {
  return r = D.exec(r)[0] + (r.endsWith("/>") ? "/>" : ">"), r;
}
function E(r, t, e) {
  return [
    "<",
    t,
    ' class="',
    e,
    '">',
    r,
    "</",
    t,
    ">"
  ].join("");
}
function W(r) {
  return r === "<";
}
function R(r) {
  return r === ">";
}
function b(r) {
  return r === "&";
}
function L(r) {
  return r === ";";
}
function p(r) {
  return A.test(r);
}
function B(r) {
  return I(r) ? z(r) : r;
}
function O(r) {
  return j.test(r);
}
function k(r, t, e) {
  return r.push(t), r.length > e && r.shift(), r.length !== e ? null : r.join("");
}
class q {
  constructor(t, e, n, s, o, l, i) {
    this.oldWords = t, this.newWords = e, this.startInOld = n, this.endInOld = s, this.startInNew = o, this.endInNew = l, this.options = i;
  }
  indexNewWords() {
    this.wordIndices = /* @__PURE__ */ new Map();
    let t = [];
    for (let e = this.startInNew; e < this.endInNew; e++) {
      let n = this.normalizeForIndex(this.newWords[e]), s = k(t, n, this.options.blockSize);
      s !== null && (this.wordIndices.has(s) ? this.wordIndices.get(s).push(e) : this.wordIndices.set(s, [e]));
    }
  }
  // Converts the word to index-friendly value so it can be compared with other similar words
  normalizeForIndex(t) {
    return t = B(t), this.options.IgnoreWhiteSpaceDifferences && p(t) ? " " : t;
  }
  findMatch() {
    if (this.indexNewWords(), this.removeRepeatingWords(), this.wordIndices.length === 0)
      return null;
    let t = this.startInOld, e = this.startInNew, n = 0, s = /* @__PURE__ */ new Map();
    const o = this.options.blockSize;
    let l = [];
    for (let i = this.startInOld; i < this.endInOld; i++) {
      let d = this.normalizeForIndex(this.oldWords[i]), a = k(l, d, o);
      if (a === null)
        continue;
      let f = /* @__PURE__ */ new Map();
      if (!this.wordIndices.has(a)) {
        s = f;
        continue;
      }
      for (let g of this.wordIndices.get(a)) {
        let w = (s.has(g - 1) ? s.get(g - 1) : 0) + 1;
        f.set(g, w), w > n && (t = i - w - o + 2, e = g - w - o + 2, n = w);
      }
      s = f;
    }
    return n !== 0 ? new m(t, e, n + o - 1) : null;
  }
  // This method removes words that occur too many times. This way it reduces total count of comparison operations
  // and as result the diff algoritm takes less time. But the side effect is that it may detect false differences of
  // the repeating words.
  removeRepeatingWords() {
    let t = this.newWords.length + this.options.repeatingWordsAccuracy, e = Array.from(this.wordIndices.entries()).filter((n) => n[1].length > t).map((n) => n[0]);
    for (let n of e)
      this.wordIndices.delete(n);
  }
}
class N {
  constructor(t, e, n, s, o) {
    this.action = t, this.startInOld = e, this.endInOld = n, this.startInNew = s, this.endInNew = o;
  }
}
const h = {
  character: 0,
  tag: 1,
  whitespace: 2,
  entity: 3
};
function T(r, t) {
  let e = {
    mode: h.character,
    currentWord: [],
    words: []
  }, n = F(r, t), s = !!n.size, o = !1, l = -1;
  for (let d = 0; d < r.length; d++) {
    var i = r[d];
    if (s) {
      l === index && (l = -1, o = !1);
      let a = 0;
      if (n.has(index) && (a = n.get(index), o = !0, l = a), o) {
        e.currentWord.push(i), e.mode = h.character;
        continue;
      }
    }
    switch (e.mode) {
      case h.character:
        W(i) ? u(e, "<", h.tag) : b(i) ? u(e, i, h.entity) : p(i) ? u(e, i, h.whitespace) : O(i) && (e.currentWord.length === 0 || O(e.currentWord[e.currentWord.length - 1])) ? e.currentWord.push(i) : u(e, i, h.character);
        break;
      case h.tag:
        R(i) ? (e.currentWord.push(i), e.words.push(e.currentWord.join("")), e.currentWord = [], e.mode = p(i) ? h.whitespace : h.character) : e.currentWord.push(i);
        break;
      case h.whitespace:
        W(i) ? u(e, i, h.tag) : b(i) ? u(e, i, h.entity) : p(i) ? e.currentWord.push(i) : u(e, i, h.character);
        break;
      case h.entity:
        if (W(i))
          u(e, i, h.tag);
        else if (p(i))
          u(e, i, h.whitespace);
        else if (L(i)) {
          let a = !0;
          if (e.currentWord.length !== 0 && (e.currentWord.push(i), e.words.push(e.currentWord.join("")), e.words.length > 2 && p(e.words[e.words.length - 2]) && p(e.words[e.words.length - 1]))) {
            let f = e.words[e.words.length - 2], g = e.words[e.words.length - 1];
            e.words.splice(e.words.length - 2, 2), e.currentWord = [(f + g).split()], e.mode = h.whitespace, a = !1;
          }
          a && (e.currentWord = [], e.mode = h.character);
        } else O(i) ? e.currentWord.push(i) : u(e, i, h.character);
        break;
    }
  }
  return e.currentWord.length !== 0 && e.words.push(e.currentWord.join("")), e.words;
}
function u(r, t, e) {
  r.currentWord.length !== 0 && r.words.push(r.currentWord.join("")), r.currentWord = [t], r.mode = e;
}
function F(r, t) {
  let e = /* @__PURE__ */ new Map();
  if (t === null)
    return e;
  for (let n of t) {
    let s;
    for (; (s = n.exec(r)) !== null; ) {
      if (e.has(s.index))
        throw new Error("One or more block expressions result in a text sequence that overlaps. Current expression: " + n.toString());
      e.set(s.index, s.index + s[0].length);
    }
  }
  return e;
}
const G = 4, M = /* @__PURE__ */ new Map([
  ["</strong>", 0],
  ["</em>", 0],
  ["</b>", 0],
  ["</i>", 0],
  ["</big>", 0],
  ["</small>", 0],
  ["</u>", 0],
  ["</sub>", 0],
  ["</strike>", 0],
  ["</s>", 0],
  ["</dfn>", 0]
]), x = /<((strong)|(b)|(i)|(dfn)|(em)|(big)|(small)|(u)|(sub)|(sup)|(strike)|(s))[\>\s]+/ig;
class y {
  constructor(t, e) {
    this.content = [], this.newText = e, this.oldText = t, this.specialTagDiffStack = [], this.newWords = [], this.oldWords = [], this.matchGranularity = 0, this.blockExpressions = [], this.repeatingWordsAccuracy = 1, this.ignoreWhiteSpaceDifferences = !1, this.orphanMatchThreshold = 0;
  }
  build() {
    if (this.oldText === this.newText)
      return this.newText;
    this.splitInputsIntoWords(), this.matchGranularity = Math.min(G, this.oldWords.length, this.newWords.length);
    let t = this.operations();
    for (let e of t)
      this.performOperation(e);
    return this.content.join("");
  }
  addBlockExpression(t) {
    this.blockExpressions.push(t);
  }
  splitInputsIntoWords() {
    this.oldWords = T(this.oldText, this.blockExpressions), this.oldText = null, this.newWords = T(this.newText, this.blockExpressions), this.newText = null;
  }
  performOperation(t) {
    switch (t.action) {
      case c.equal:
        this.processEqualOperation(t);
        break;
      case c.delete:
        this.processDeleteOperation(t, "diffdel");
        break;
      case c.insert:
        this.processInsertOperation(t, "diffins");
        break;
      case c.none:
        break;
      case c.replace:
        this.processReplaceOperation(t);
        break;
    }
  }
  processReplaceOperation(t) {
    this.processDeleteOperation(t, "diffmod"), this.processInsertOperation(t, "diffmod");
  }
  processInsertOperation(t, e) {
    let n = this.newWords.filter((s, o) => o >= t.startInNew && o < t.endInNew);
    this.insertTag("ins", e, n);
  }
  processDeleteOperation(t, e) {
    let n = this.oldWords.filter((s, o) => o >= t.startInOld && o < t.endInOld);
    this.insertTag("del", e, n);
  }
  processEqualOperation(t) {
    let e = this.newWords.filter((n, s) => s >= t.startInNew && s < t.endInNew);
    this.content.push(e.join(""));
  }
  insertTag(t, e, n) {
    for (; n.length; ) {
      let s = this.extractConsecutiveWords(n, (i) => !I(i)), o = "", l = !1;
      if (s.length !== 0) {
        let i = E(s.join(""), t, e);
        this.content.push(i);
      } else {
        if (x.test(n[0])) {
          let i = n[0].match(x);
          if (i = "<" + i[0].replace(/(<|>| )/g, "") + ">", this.specialTagDiffStack.push(i), o = '<ins class="mod">', t === "del")
            for (n.shift(); n.length > 0 && x.test(n[0]); )
              n.shift();
        } else if (M.has(n[0])) {
          let i = this.specialTagDiffStack.length === 0 ? null : this.specialTagDiffStack.pop();
          if (i === null || i !== n[0].replace(/\//g, "") || (o = "</ins>", l = !0), t === "del")
            for (n.shift(); n.length > 0 && M.has(n[0]); )
              n.shift();
        }
        if (n.length === 0 && o.length === 0)
          break;
        l ? this.content.push(o + this.extractConsecutiveWords(n, I).join("")) : this.content.push(this.extractConsecutiveWords(n, I).join("") + o);
      }
    }
  }
  extractConsecutiveWords(t, e) {
    let n = null;
    for (let s = 0; s < t.length; s++) {
      let o = t[s];
      if (s === 0 && o === " " && (t[s] = "&nbsp;"), !e(o)) {
        n = s;
        break;
      }
    }
    if (n !== null) {
      let s = t.filter((o, l) => l >= 0 && l < n);
      return n > 0 && t.splice(0, n), s;
    } else {
      let s = t.filter((o, l) => l >= 0 && l < t.length);
      return t.splice(0, t.length), s;
    }
  }
  operations() {
    let t = 0, e = 0, n = [], s = this.matchingBlocks();
    s.push(new m(this.oldWords.length, this.newWords.length, 0));
    let o = this.removeOrphans(s);
    for (let l of o) {
      let i = t === l.startInOld, d = e === l.startInNew, a;
      !i && !d ? a = c.replace : i && !d ? a = c.insert : i ? a = c.none : a = c.delete, a !== c.none && n.push(new N(a, t, l.startInOld, e, l.startInNew)), l.length !== 0 && n.push(new N(c.equal, l.startInOld, l.endInOld, l.startInNew, l.endInNew)), t = l.endInOld, e = l.endInNew;
    }
    return n;
  }
  *removeOrphans(t) {
    let e = null, n = null;
    for (let s of t) {
      if (n === null) {
        e = new m(0, 0, 0), n = s;
        continue;
      }
      if (e.endInOld === n.startInOld && e.endInNew === n.startInNew || n.endInOld === s.startInOld && n.endInNew === s.startInNew) {
        yield n, e = n, n = s;
        continue;
      }
      let o = (a, f) => a + f.length, l = this.oldWords.slice(e.endInOld, s.startInOld).reduce(o, 0), i = this.newWords.slice(e.endInNew, s.startInNew).reduce(o, 0);
      this.newWords.slice(n.startInNew, n.endInNew).reduce(o, 0) > Math.max(l, i) * this.orphanMatchThreshold && (yield n), e = n, n = s;
    }
    yield n;
  }
  matchingBlocks() {
    let t = [];
    return this.findMatchingBlocks(0, this.oldWords.length, 0, this.newWords.length, t), t;
  }
  findMatchingBlocks(t, e, n, s, o) {
    let l = this.findMatch(t, e, n, s);
    l !== null && (t < l.startInOld && n < l.startInNew && this.findMatchingBlocks(t, l.startInOld, n, l.startInNew, o), o.push(l), l.endInOld < e && l.endInNew < s && this.findMatchingBlocks(l.endInOld, e, l.endInNew, s, o));
  }
  findMatch(t, e, n, s) {
    for (let o = this.matchGranularity; o > 0; o--) {
      let l = new C();
      l.blockSize = o, l.repeatingWordsAccuracy = this.repeatingWordsAccuracy, l.ignoreWhitespaceDifferences = this.ignoreWhiteSpaceDifferences;
      let d = new q(this.oldWords, this.newWords, t, e, n, s, l).findMatch();
      if (d !== null)
        return d;
    }
    return null;
  }
}
y.execute = function(r, t) {
  return new y(r, t).build();
};
export {
  y as default
};
