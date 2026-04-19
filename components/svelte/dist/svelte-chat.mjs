//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region node_modules/svelte/src/internal/flags/index.js
var e = !1, t = !1;
function n() {
	t = !0;
}
//#endregion
//#region node_modules/svelte/src/internal/flags/legacy.js
n();
//#endregion
//#region node_modules/svelte/src/constants.js
var r = {}, i = Symbol(), a = "http://www.w3.org/1999/xhtml", o = Array.isArray, s = Array.prototype.indexOf, c = Array.prototype.includes, l = Array.from, u = Object.defineProperty, d = Object.getOwnPropertyDescriptor, f = Object.getOwnPropertyDescriptors, p = Object.prototype, m = Array.prototype, h = Object.getPrototypeOf, g = () => {};
function _(e) {
	return e();
}
function v(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function y() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var b = 1024, x = 2048, S = 4096, ee = 8192, C = 16384, te = 32768, ne = 1 << 25, re = 65536, ie = 1 << 19, ae = 1 << 20, oe = 1 << 25, se = 65536, ce = 1 << 21, le = 1 << 22, ue = 1 << 23, de = Symbol("$state"), fe = Symbol("legacy props"), pe = Symbol(""), w = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), me = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function he() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function ge(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function _e(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function ve() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ye(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function be() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function xe(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function Se() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ce() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function we() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Te() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Ee(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var T = !1;
function De(e) {
	T = e;
}
var E;
function D(e) {
	if (e === null) throw Ee(), r;
	return E = e;
}
function Oe() {
	return D(/* @__PURE__ */ L(E));
}
function ke(e) {
	if (T) {
		if (/* @__PURE__ */ L(E) !== null) throw Ee(), r;
		E = e;
	}
}
function Ae(e = !0) {
	for (var t = 0, n = E;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ L(n);
		e && n.remove(), n = i;
	}
}
function je(e) {
	if (!e || e.nodeType !== 8) throw Ee(), r;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Me(e) {
	return e === this.v;
}
function Ne(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Pe(e) {
	return !Ne(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var O = null;
function Fe(e) {
	O = e;
}
function Ie(e, n = !1, r) {
	O = {
		p: O,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: U,
		l: t && !n ? {
			s: null,
			u: null,
			$: []
		} : null
	};
}
function Le(e) {
	var t = O, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) rn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, O = t.p, e ?? {};
}
function Re() {
	return !t || O !== null && O.l === null;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var ze = [];
function Be() {
	var e = ze;
	ze = [], v(e);
}
function Ve(e) {
	if (ze.length === 0 && !et) {
		var t = ze;
		queueMicrotask(() => {
			t === ze && Be();
		});
	}
	ze.push(e);
}
function He() {
	for (; ze.length > 0;) Be();
}
function Ue(e) {
	var t = U;
	if (t === null) return B.f |= ue, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	We(e, t);
}
function We(e, t) {
	for (; t !== null;) {
		if (t.f & 128) {
			if (!(t.f & 32768)) throw e;
			try {
				t.b.error(e);
				return;
			} catch (t) {
				e = t;
			}
		}
		t = t.parent;
	}
	throw e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var Ge = ~(x | S | b);
function k(e, t) {
	e.f = e.f & Ge | t;
}
function Ke(e) {
	e.f & 512 || e.deps === null ? k(e, b) : k(e, S);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function qe(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= se, qe(t.deps));
}
function Je(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), qe(e.deps), k(e, b);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var Ye = !1, Xe = !1;
function Ze(e) {
	var t = Xe;
	try {
		return Xe = !1, [e(), Xe];
	} finally {
		Xe = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var A = /* @__PURE__ */ new Set(), j = null, Qe = null, M = null, $e = null, et = !1, tt = !1, nt = null, rt = null, it = 0, at = 1, ot = class t {
	id = at++;
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#e = /* @__PURE__ */ new Set();
	#t = /* @__PURE__ */ new Set();
	#n = /* @__PURE__ */ new Set();
	#r = /* @__PURE__ */ new Map();
	#i = /* @__PURE__ */ new Map();
	#a = null;
	#o = [];
	#s = [];
	#c = /* @__PURE__ */ new Set();
	#l = /* @__PURE__ */ new Set();
	#u = /* @__PURE__ */ new Map();
	#d = /* @__PURE__ */ new Set();
	is_fork = !1;
	#f = !1;
	#p = /* @__PURE__ */ new Set();
	#m() {
		return this.is_fork || this.#i.size > 0;
	}
	#h() {
		for (let n of this.#p) for (let r of n.#i.keys()) {
			for (var e = !1, t = r; t.parent !== null;) {
				if (this.#u.has(t)) {
					e = !0;
					break;
				}
				t = t.parent;
			}
			if (!e) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#u.has(e) || this.#u.set(e, {
			d: [],
			m: []
		}), this.#d.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#u.get(e);
		if (n) {
			this.#u.delete(e);
			for (var r of n.d) k(r, x), t(r);
			for (r of n.m) k(r, S), t(r);
		}
		this.#d.add(e);
	}
	#g() {
		if (it++ > 1e3 && (A.delete(this), ct()), !this.#m()) {
			for (let e of this.#c) this.#l.delete(e), k(e, x), this.schedule(e);
			for (let e of this.#l) k(e, S), this.schedule(e);
		}
		let n = this.#o;
		this.#o = [], this.apply();
		var r = nt = [], i = [], a = rt = [];
		for (let e of n) try {
			this.#_(e, r, i);
		} catch (t) {
			throw mt(e), t;
		}
		if (j = null, a.length > 0) {
			var o = t.ensure();
			for (let e of a) o.schedule(e);
		}
		if (nt = null, rt = null, this.#m() || this.#h()) {
			this.#v(i), this.#v(r);
			for (let [e, t] of this.#u) pt(e, t);
		} else {
			this.#r.size === 0 && A.delete(this), this.#c.clear(), this.#l.clear();
			for (let e of this.#e) e(this);
			this.#e.clear(), Qe = this, lt(i), lt(r), Qe = null, this.#a?.resolve();
		}
		var s = j;
		if (this.#o.length > 0) {
			let e = s ??= this;
			e.#o.push(...this.#o.filter((t) => !e.#o.includes(t)));
		}
		s !== null && (A.add(s), s.#g()), e && !A.has(this) && this.#y();
	}
	#_(t, n, r) {
		t.f ^= b;
		for (var i = t.first; i !== null;) {
			var a = i.f, o = (a & 96) != 0;
			if (!(o && a & 1024 || a & 8192 || this.#u.has(i)) && i.fn !== null) {
				o ? i.f ^= b : a & 4 ? n.push(i) : e && a & 16777224 ? r.push(i) : An(i) && (a & 16 && this.#l.add(i), Fn(i));
				var s = i.first;
				if (s !== null) {
					i = s;
					continue;
				}
			}
			for (; i !== null;) {
				var c = i.next;
				if (c !== null) {
					i = c;
					break;
				}
				i = i.parent;
			}
		}
	}
	#v(e) {
		for (var t = 0; t < e.length; t += 1) Je(e[t], this.#c, this.#l);
	}
	capture(e, t, n = !1) {
		e.v !== i && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), M?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		j = this;
	}
	deactivate() {
		j = null, M = null;
	}
	flush() {
		try {
			tt = !0, j = this, this.#g();
		} finally {
			it = 0, $e = null, nt = null, rt = null, tt = !1, j = null, M = null, P.clear();
		}
	}
	discard() {
		for (let e of this.#t) e(this);
		this.#t.clear(), this.#n.clear(), A.delete(this);
	}
	register_created_effect(e) {
		this.#s.push(e);
	}
	#y() {
		for (let l of A) {
			var e = l.id < this.id, t = [];
			for (let [r, [i, a]] of this.current) {
				if (l.current.has(r)) {
					var n = l.current.get(r)[0];
					if (e && i !== n) l.current.set(r, [i, a]);
					else continue;
				}
				t.push(r);
			}
			var r = [...l.current.keys()].filter((e) => !this.current.has(e));
			if (r.length === 0) e && l.discard();
			else if (t.length > 0) {
				if (e) for (let e of this.#d) l.unskip_effect(e, (e) => {
					e.f & 4194320 ? l.schedule(e) : l.#v([e]);
				});
				l.activate();
				var i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
				for (var o of t) ut(o, r, i, a);
				a = /* @__PURE__ */ new Map();
				var s = [...l.current.keys()].filter((e) => this.current.has(e) ? this.current.get(e)[0] !== e : !0);
				for (let e of this.#s) !(e.f & 155648) && dt(e, s, a) && (e.f & 4194320 ? (k(e, x), l.schedule(e)) : l.#c.add(e));
				if (l.#o.length > 0) {
					l.apply();
					for (var c of l.#o) l.#_(c, [], []);
					l.#o = [];
				}
				l.deactivate();
			}
		}
		for (let e of A) e.#p.has(this) && (e.#p.delete(this), e.#p.size === 0 && !e.#m() && (e.activate(), e.#g()));
	}
	increment(e, t) {
		let n = this.#r.get(t) ?? 0;
		if (this.#r.set(t, n + 1), e) {
			let e = this.#i.get(t) ?? 0;
			this.#i.set(t, e + 1);
		}
	}
	decrement(e, t, n) {
		let r = this.#r.get(t) ?? 0;
		if (r === 1 ? this.#r.delete(t) : this.#r.set(t, r - 1), e) {
			let e = this.#i.get(t) ?? 0;
			e === 1 ? this.#i.delete(t) : this.#i.set(t, e - 1);
		}
		this.#f || n || (this.#f = !0, Ve(() => {
			this.#f = !1, this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#c.add(t);
		for (let e of t) this.#l.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#e.add(e);
	}
	ondiscard(e) {
		this.#t.add(e);
	}
	on_fork_commit(e) {
		this.#n.add(e);
	}
	run_fork_commit_callbacks() {
		for (let e of this.#n) e(this);
		this.#n.clear();
	}
	settled() {
		return (this.#a ??= y()).promise;
	}
	static ensure() {
		if (j === null) {
			let e = j = new t();
			tt || (A.add(j), et || Ve(() => {
				j === e && e.flush();
			}));
		}
		return j;
	}
	apply() {
		if (!e || !this.is_fork && A.size === 1) {
			M = null;
			return;
		}
		M = /* @__PURE__ */ new Map();
		for (let [e, [t]] of this.current) M.set(e, t);
		for (let e of A) if (!(e === this || e.is_fork)) {
			var t = !1, n = !1;
			if (e.id < this.id) for (let [r, [, i]] of e.current) i || (t ||= this.current.has(r), n ||= !this.current.has(r));
			if (t && n) this.#p.add(e);
			else for (let [t, n] of e.previous) M.has(t) || M.set(t, n);
		}
	}
	schedule(t) {
		if ($e = t, t.b?.is_pending && t.f & 16777228 && !(t.f & 32768)) {
			t.b.defer_effect(t);
			return;
		}
		for (var n = t; n.parent !== null;) {
			n = n.parent;
			var r = n.f;
			if (nt !== null && n === U && (e || (B === null || !(B.f & 2)) && !Ye)) return;
			if (r & 96) {
				if (!(r & 1024)) return;
				n.f ^= b;
			}
		}
		this.#o.push(n);
	}
};
function st(e) {
	var t = et;
	et = !0;
	try {
		var n;
		for (e && (j !== null && !j.is_fork && j.flush(), n = e());;) {
			if (He(), j === null) return n;
			j.flush();
		}
	} finally {
		et = t;
	}
}
function ct() {
	try {
		be();
	} catch (e) {
		We(e, $e);
	}
}
var N = null;
function lt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && An(r) && (N = /* @__PURE__ */ new Set(), Fn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && gn(r), N?.size > 0)) {
				P.clear();
				for (let e of N) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) N.has(n) && (N.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Fn(n);
					}
				}
				N.clear();
			}
		}
		N = null;
	}
}
function ut(e, t, n, r) {
	if (!n.has(e) && (n.add(e), e.reactions !== null)) for (let i of e.reactions) {
		let e = i.f;
		e & 2 ? ut(i, t, n, r) : e & 4194320 && !(e & 2048) && dt(i, t, r) && (k(i, x), ft(i));
	}
}
function dt(e, t, n) {
	let r = n.get(e);
	if (r !== void 0) return r;
	if (e.deps !== null) for (let r of e.deps) {
		if (c.call(t, r)) return !0;
		if (r.f & 2 && dt(r, t, n)) return n.set(r, !0), !0;
	}
	return n.set(e, !1), !1;
}
function ft(e) {
	j.schedule(e);
}
function pt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), k(e, b);
		for (var n = e.first; n !== null;) pt(n, t), n = n.next;
	}
}
function mt(e) {
	k(e, b);
	for (var t = e.first; t !== null;) mt(t), t = t.next;
}
re | ie;
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function ht(e, t, n, r) {
	let i = Re() ? yt : xt;
	var a = e.filter((e) => !e.settled);
	if (n.length === 0 && a.length === 0) {
		r(t.map(i));
		return;
	}
	var o = U, s = gt(), c = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function l(e) {
		s();
		try {
			r(e);
		} catch (e) {
			o.f & 16384 || We(e, o);
		}
		_t();
	}
	if (n.length === 0) {
		c.then(() => l(t.map(i)));
		return;
	}
	var u = vt();
	function d() {
		Promise.all(n.map((e) => /* @__PURE__ */ bt(e))).then((e) => l([...t.map(i), ...e])).catch((e) => We(e, o)).finally(() => u());
	}
	c ? c.then(() => {
		s(), d(), _t();
	}) : d();
}
function gt() {
	var e = U, t = B, n = O, r = j;
	return function(i = !0) {
		W(e), H(t), Fe(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function _t(e = !0) {
	W(null), H(null), Fe(null), e && j?.deactivate();
}
function vt() {
	var e = U, t = e.b, n = j, r = t.is_rendered();
	return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
		t.update_pending_count(-1, n), n.decrement(r, e, i);
	};
}
/* @__NO_SIDE_EFFECTS__ */
function yt(e) {
	var t = 2 | x;
	return U !== null && (U.f |= ie), {
		ctx: O,
		deps: null,
		effects: null,
		equals: Me,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: i,
		wv: 0,
		parent: U,
		ac: null
	};
}
/* @__NO_SIDE_EFFECTS__ */
function bt(e, t, n) {
	let r = U;
	r === null && he();
	var a = void 0, o = kt(i), s = !B, c = /* @__PURE__ */ new Map();
	return on(() => {
		var t = U, n = y();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, n.reject).finally(_t);
		} catch (e) {
			n.reject(e), _t();
		}
		var i = j;
		if (s) {
			if (t.f & 32768) var l = vt();
			if (r.b.is_rendered()) c.get(i)?.reject(w), c.delete(i);
			else {
				for (let e of c.values()) e.reject(w);
				c.clear();
			}
			c.set(i, n);
		}
		let u = (e, n = void 0) => {
			if (l && l(n === w), !(n === w || t.f & 16384)) {
				if (i.activate(), n) o.f |= ue, jt(o, n);
				else {
					o.f & 8388608 && (o.f ^= ue), jt(o, e);
					for (let [e, t] of c) {
						if (c.delete(e), e === i) break;
						t.reject(w);
					}
				}
				i.deactivate();
			}
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), tn(() => {
		for (let e of c.values()) e.reject(w);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === a ? e(o) : t(a);
			}
			n.then(r, r);
		}
		t(a);
	});
}
/* @__NO_SIDE_EFFECTS__ */
function xt(e) {
	let t = /* @__PURE__ */ yt(e);
	return t.equals = Pe, t;
}
function St(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) mn(t[n]);
	}
}
function Ct(e) {
	var t, n = U, r = e.parent;
	if (!z && r !== null && r.f & 24576) return Te(), e.v;
	W(r);
	try {
		e.f &= ~se, St(e), t = Mn(e);
	} finally {
		W(n);
	}
	return t;
}
function wt(e) {
	var t = Ct(e);
	if (!e.equals(t) && (e.wv = kn(), (!j?.is_fork || e.deps === null) && (j === null ? e.v = t : j.capture(e, t, !0), e.deps === null))) {
		k(e, b);
		return;
	}
	z || (M === null ? Ke(e) : (en() || j?.is_fork) && M.set(e, t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(w), t.teardown = g, t.ac = null, Pn(t, 0), fn(t));
}
function Et(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && Fn(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Dt = /* @__PURE__ */ new Set(), P = /* @__PURE__ */ new Map(), Ot = !1;
function kt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Me,
		rv: 0,
		wv: 0
	};
}
/* @__NO_SIDE_EFFECTS__ */
function F(e, t) {
	let n = kt(e, t);
	return Tn(n), n;
}
/* @__NO_SIDE_EFFECTS__ */
function At(e, n = !1, r = !0) {
	let i = kt(e);
	return n || (i.equals = Pe), t && r && O !== null && O.l !== null && (O.l.s ??= []).push(i), i;
}
function I(e, t, n = !1) {
	return B !== null && (!V || B.f & 131072) && Re() && B.f & 4325394 && (G === null || !c.call(G, e)) && we(), jt(e, n ? Ft(t) : t, rt);
}
function jt(e, t, n = null) {
	if (!e.equals(t)) {
		P.set(e, z ? t : e.v);
		var r = ot.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Ct(t), M === null && Ke(t);
		}
		e.wv = kn(), Pt(e, x, n), Re() && U !== null && U.f & 1024 && !(U.f & 96) && (J === null ? En([e]) : J.push(e)), !r.is_fork && Dt.size > 0 && !Ot && Mt();
	}
	return t;
}
function Mt() {
	Ot = !1;
	for (let e of Dt) e.f & 1024 && k(e, S), An(e) && Fn(e);
	Dt.clear();
}
function Nt(e) {
	I(e, e.v + 1);
}
function Pt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Re(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === U)) {
			var l = (c & x) === 0;
			if (l && k(s, t), c & 2) {
				var u = s;
				M?.delete(u), c & 65536 || (c & 512 && (s.f |= se), Pt(u, S, n));
			} else if (l) {
				var d = s;
				c & 16 && N !== null && N.add(d), n === null ? ft(d) : n.push(d);
			}
		}
	}
}
function Ft(e) {
	if (typeof e != "object" || !e || de in e) return e;
	let t = h(e);
	if (t !== p && t !== m) return e;
	var n = /* @__PURE__ */ new Map(), r = o(e), a = /* @__PURE__ */ F(0), s = null, c = X, l = (e) => {
		if (X === c) return e();
		var t = B, n = X;
		H(null), On(c);
		var r = e();
		return H(t), On(n), r;
	};
	return r && n.set("length", /* @__PURE__ */ F(e.length, s)), new Proxy(e, {
		defineProperty(e, t, r) {
			(!("value" in r) || r.configurable === !1 || r.enumerable === !1 || r.writable === !1) && Se();
			var i = n.get(t);
			return i === void 0 ? l(() => {
				var e = /* @__PURE__ */ F(r.value, s);
				return n.set(t, e), e;
			}) : I(i, r.value, !0), !0;
		},
		deleteProperty(e, t) {
			var r = n.get(t);
			if (r === void 0) {
				if (t in e) {
					let e = l(() => /* @__PURE__ */ F(i, s));
					n.set(t, e), Nt(a);
				}
			} else I(r, i), Nt(a);
			return !0;
		},
		get(t, r, a) {
			if (r === de) return e;
			var o = n.get(r), c = r in t;
			if (o === void 0 && (!c || d(t, r)?.writable) && (o = l(() => /* @__PURE__ */ F(Ft(c ? t[r] : i), s)), n.set(r, o)), o !== void 0) {
				var u = Z(o);
				return u === i ? void 0 : u;
			}
			return Reflect.get(t, r, a);
		},
		getOwnPropertyDescriptor(e, t) {
			var r = Reflect.getOwnPropertyDescriptor(e, t);
			if (r && "value" in r) {
				var a = n.get(t);
				a && (r.value = Z(a));
			} else if (r === void 0) {
				var o = n.get(t), s = o?.v;
				if (o !== void 0 && s !== i) return {
					enumerable: !0,
					configurable: !0,
					value: s,
					writable: !0
				};
			}
			return r;
		},
		has(e, t) {
			if (t === de) return !0;
			var r = n.get(t), a = r !== void 0 && r.v !== i || Reflect.has(e, t);
			return (r !== void 0 || U !== null && (!a || d(e, t)?.writable)) && (r === void 0 && (r = l(() => /* @__PURE__ */ F(a ? Ft(e[t]) : i, s)), n.set(t, r)), Z(r) === i) ? !1 : a;
		},
		set(e, t, o, c) {
			var u = n.get(t), f = t in e;
			if (r && t === "length") for (var p = o; p < u.v; p += 1) {
				var m = n.get(p + "");
				m === void 0 ? p in e && (m = l(() => /* @__PURE__ */ F(i, s)), n.set(p + "", m)) : I(m, i);
			}
			if (u === void 0) (!f || d(e, t)?.writable) && (u = l(() => /* @__PURE__ */ F(void 0, s)), I(u, Ft(o)), n.set(t, u));
			else {
				f = u.v !== i;
				var h = l(() => Ft(o));
				I(u, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, t);
			if (g?.set && g.set.call(c, o), !f) {
				if (r && typeof t == "string") {
					var _ = n.get("length"), v = Number(t);
					Number.isInteger(v) && v >= _.v && I(_, v + 1);
				}
				Nt(a);
			}
			return !0;
		},
		ownKeys(e) {
			Z(a);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = n.get(e);
				return t === void 0 || t.v !== i;
			});
			for (var [r, o] of n) o.v !== i && !(r in e) && t.push(r);
			return t;
		},
		setPrototypeOf() {
			Ce();
		}
	});
}
var It, Lt, Rt;
function zt(e = "") {
	return document.createTextNode(e);
}
/* @__NO_SIDE_EFFECTS__ */
function Bt(e) {
	return Lt.call(e);
}
/* @__NO_SIDE_EFFECTS__ */
function L(e) {
	return Rt.call(e);
}
function Vt(e, t) {
	if (!T) return /* @__PURE__ */ Bt(e);
	var n = /* @__PURE__ */ Bt(E);
	if (n === null) n = E.appendChild(zt());
	else if (t && n.nodeType !== 3) {
		var r = zt();
		return n?.before(r), D(r), r;
	}
	return t && Kt(n), D(n), n;
}
function Ht(e, t = 1, n = !1) {
	let r = T ? E : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ L(r);
	if (!T) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = zt();
			return r === null ? i?.after(a) : r.before(a), D(a), a;
		}
		Kt(r);
	}
	return D(r), r;
}
function Ut(e) {
	e.textContent = "";
}
function Wt() {
	return !e || N !== null ? !1 : (U.f & te) !== 0;
}
function Gt(e, t, n) {
	let r = n ? { is: n } : void 0;
	return document.createElementNS(t ?? "http://www.w3.org/1999/xhtml", e, r);
}
function Kt(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function qt(e) {
	T && /* @__PURE__ */ Bt(e) !== null && Ut(e);
}
var Jt = !1;
function Yt() {
	Jt || (Jt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t.__on_r?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Xt(e) {
	var t = B, n = U;
	H(null), W(null);
	try {
		return e();
	} finally {
		H(t), W(n);
	}
}
function Zt(e, t, n, r = n) {
	e.addEventListener(t, () => Xt(n));
	let i = e.__on_r;
	i ? e.__on_r = () => {
		i(), r(!0);
	} : e.__on_r = () => r(!0), Yt();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function Qt(e) {
	U === null && (B === null && ye(e), ve()), z && _e(e);
}
function $t(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function R(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= ee);
	var r = {
		ctx: O,
		deps: null,
		nodes: null,
		f: e | x | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	j?.register_created_effect(r);
	var i = r;
	if (e & 4) nt === null ? ot.ensure().schedule(r) : nt.push(r);
	else if (t !== null) {
		try {
			Fn(r);
		} catch (e) {
			throw mn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= re));
	}
	if (i !== null && (i.parent = n, n !== null && $t(i, n), B !== null && B.f & 2 && !(e & 64))) {
		var a = B;
		(a.effects ??= []).push(i);
	}
	return r;
}
function en() {
	return B !== null && !V;
}
function tn(e) {
	let t = R(8, null);
	return k(t, b), t.teardown = e, t;
}
function nn(e) {
	Qt("$effect");
	var t = U.f;
	if (!B && t & 32 && !(t & 32768)) {
		var n = O;
		(n.e ??= []).push(e);
	} else return rn(e);
}
function rn(e) {
	return R(4 | ae, e);
}
function an(e) {
	return Qt("$effect.pre"), R(8 | ae, e);
}
function on(e) {
	return R(le | ie, e);
}
function sn(e, t = 0) {
	return R(8 | t, e);
}
function cn(e, t = [], n = [], r = []) {
	ht(r, t, n, (t) => {
		R(8, () => e(...t.map(Z)));
	});
}
function ln(e, t = 0) {
	return R(16 | t, e);
}
function un(e) {
	return R(32 | ie, e);
}
function dn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = z, n = B;
		wn(!0), H(null);
		try {
			t.call(null);
		} finally {
			wn(e), H(n);
		}
	}
}
function fn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Xt(() => {
			e.abort(w);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : mn(n, t), n = r;
	}
}
function pn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || mn(t), t = n;
	}
}
function mn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (hn(e.nodes.start, e.nodes.end), n = !0), k(e, ne), fn(e, t && !n), Pn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	dn(e), e.f ^= ne, e.f |= C;
	var i = e.parent;
	i !== null && i.first !== null && gn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function hn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ L(e);
		e.remove(), e = n;
	}
}
function gn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function _n(e, t, n = !0) {
	var r = [];
	vn(e, r, !0);
	var i = () => {
		n && mn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function vn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= ee;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = (i.f & 65536) != 0 || (i.f & 32) != 0 && (e.f & 16) != 0;
				vn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function yn(e) {
	bn(e, !0);
}
function bn(e, t) {
	if (e.f & 8192) {
		e.f ^= ee, e.f & 1024 || (k(e, x), ot.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = (n.f & 65536) != 0 || (n.f & 32) != 0;
			bn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function xn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ L(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Sn = null, Cn = !1, z = !1;
function wn(e) {
	z = e;
}
var B = null, V = !1;
function H(e) {
	B = e;
}
var U = null;
function W(e) {
	U = e;
}
var G = null;
function Tn(t) {
	B !== null && (!e || B.f & 2) && (G === null ? G = [t] : G.push(t));
}
var K = null, q = 0, J = null;
function En(e) {
	J = e;
}
var Dn = 1, Y = 0, X = Y;
function On(e) {
	X = e;
}
function kn() {
	return ++Dn;
}
function An(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~se), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (An(a) && wt(a), a.wv > e.wv) return !0;
		}
		t & 512 && M === null && k(e, b);
	}
	return !1;
}
function jn(t, n, r = !0) {
	var i = t.reactions;
	if (i !== null && !(!e && G !== null && c.call(G, t))) for (var a = 0; a < i.length; a++) {
		var o = i[a];
		o.f & 2 ? jn(o, n, !1) : n === o && (r ? k(o, x) : o.f & 1024 && k(o, S), ft(o));
	}
}
function Mn(e) {
	var t = K, n = q, r = J, i = B, a = G, o = O, s = V, c = X, l = e.f;
	K = null, q = 0, J = null, B = l & 96 ? null : e, G = null, Fe(e.ctx), V = !1, X = ++Y, e.ac !== null && (Xt(() => {
		e.ac.abort(w);
	}), e.ac = null);
	try {
		e.f |= ce;
		var u = e.fn, d = u();
		e.f |= te;
		var f = e.deps, p = j?.is_fork;
		if (K !== null) {
			var m;
			if (p || Pn(e, q), f !== null && q > 0) for (f.length = q + K.length, m = 0; m < K.length; m++) f[q + m] = K[m];
			else e.deps = f = K;
			if (en() && e.f & 512) for (m = q; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && q < f.length && (Pn(e, q), f.length = q);
		if (Re() && J !== null && !V && f !== null && !(e.f & 6146)) for (m = 0; m < J.length; m++) jn(J[m], e);
		if (i !== null && i !== e) {
			if (Y++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Y;
			if (t !== null) for (let e of t) e.rv = Y;
			J !== null && (r === null ? r = J : r.push(...J));
		}
		return e.f & 8388608 && (e.f ^= ue), d;
	} catch (e) {
		return Ue(e);
	} finally {
		e.f ^= ce, K = t, q = n, J = r, B = i, G = a, Fe(o), V = s, X = c;
	}
}
function Nn(e, t) {
	let n = t.reactions;
	if (n !== null) {
		var r = s.call(n, e);
		if (r !== -1) {
			var a = n.length - 1;
			a === 0 ? n = t.reactions = null : (n[r] = n[a], n.pop());
		}
	}
	if (n === null && t.f & 2 && (K === null || !c.call(K, t))) {
		var o = t;
		o.f & 512 && (o.f ^= 512, o.f &= ~se), o.v !== i && Ke(o), Tt(o), Pn(o, 0);
	}
}
function Pn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Nn(e, n[r]);
}
function Fn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		k(e, b);
		var n = U, r = Cn;
		U = e, Cn = !0;
		try {
			t & 16777232 ? pn(e) : fn(e), dn(e);
			var i = Mn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Dn;
		} finally {
			Cn = r, U = n;
		}
	}
}
async function In() {
	if (e) return new Promise((e) => {
		requestAnimationFrame(() => e()), setTimeout(() => e());
	});
	await Promise.resolve(), st();
}
function Z(e) {
	var t = (e.f & 2) != 0;
	if (Sn?.add(e), B !== null && !V && !(U !== null && U.f & 16384) && (G === null || !c.call(G, e))) {
		var n = B.deps;
		if (B.f & 2097152) e.rv < Y && (e.rv = Y, K === null && n !== null && n[q] === e ? q++ : K === null ? K = [e] : K.push(e));
		else {
			(B.deps ??= []).push(e);
			var r = e.reactions;
			r === null ? e.reactions = [B] : c.call(r, B) || r.push(B);
		}
	}
	if (z && P.has(e)) return P.get(e);
	if (t) {
		var i = e;
		if (z) {
			var a = i.v;
			return (!(i.f & 1024) && i.reactions !== null || Rn(i)) && (a = Ct(i)), P.set(i, a), a;
		}
		var o = (i.f & 512) == 0 && !V && B !== null && (Cn || (B.f & 512) != 0), s = (i.f & te) === 0;
		An(i) && (o && (i.f |= 512), wt(i)), o && !s && (Et(i), Ln(i));
	}
	if (M?.has(e)) return M.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Ln(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Et(t), Ln(t));
}
function Rn(e) {
	if (e.v === i) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (P.has(t) || t.f & 2 && Rn(t)) return !0;
	return !1;
}
function Q(e) {
	var t = V;
	try {
		return V = !0, e();
	} finally {
		V = t;
	}
}
function zn(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (de in e) Bn(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && de in n && Bn(n);
		}
	}
}
function Bn(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			Bn(e[n], t);
		} catch {}
		let n = h(e);
		if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
			let t = f(n);
			for (let n in t) {
				let r = t[n].get;
				if (r) try {
					r.call(e);
				} catch {}
			}
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var Vn = Symbol("events");
function Hn(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Gn.call(t, e), !e.cancelBubble) return Xt(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ve(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function Un(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = Hn(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && tn(() => {
		t.removeEventListener(e, o, a);
	});
}
var Wn = null;
function Gn(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	Wn = e;
	var o = 0, s = Wn === e && e[Vn];
	if (s) {
		var c = i.indexOf(s);
		if (c !== -1 && (t === document || t === window)) {
			e[Vn] = t;
			return;
		}
		var l = i.indexOf(t);
		if (l === -1) return;
		c <= l && (o = c);
	}
	if (a = i[o] || e.target, a !== t) {
		u(e, "currentTarget", {
			configurable: !0,
			get() {
				return a || n;
			}
		});
		var d = B, f = U;
		H(null), W(null);
		try {
			for (var p, m = []; a !== null;) {
				var h = a.assignedSlot || a.parentNode || a.host || null;
				try {
					var g = a[Vn]?.[r];
					g != null && (!a.disabled || e.target === a) && g.call(a, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble || h === t || h === null) break;
				a = h;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[Vn] = t, delete e.currentTarget, H(d), W(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Kn = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function qn(e) {
	return Kn?.createHTML(e) ?? e;
}
function Jn(e) {
	var t = Gt("template");
	return t.innerHTML = qn(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Yn(e, t) {
	var n = U;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Xn(e, t) {
	var n = (t & 1) != 0, r = (t & 2) != 0, i, a = !e.startsWith("<!>");
	return () => {
		if (T) return Yn(E, null), E;
		i === void 0 && (i = Jn(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Bt(i)));
		var t = r || It ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Bt(t), s = t.lastChild;
			Yn(o, s);
		} else Yn(t, t);
		return t;
	};
}
function Zn(e, t) {
	if (T) {
		var n = U;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = E), Oe();
		return;
	}
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
function Qn(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e.__t ??= e.nodeValue) && (e.__t = n, e.nodeValue = `${n}`);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function $n(e, t, n) {
	for (var r = [], i = t.length, a, o = t.length, s = 0; s < i; s++) {
		let n = t[s];
		_n(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					er(e, l(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --o;
		}, !1);
	}
	if (o === 0) {
		var c = r.length === 0 && n !== null;
		if (c) {
			var u = n, d = u.parentNode;
			Ut(d), d.append(u), e.items.clear();
		}
		er(e, t, !c);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function er(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= oe, xn(a, document.createDocumentFragment())) : mn(t[i], n);
	}
}
var tr;
function nr(e, t, n, r, i, a = null) {
	var s = e, c = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		s = T ? D(/* @__PURE__ */ Bt(u)) : u.appendChild(zt());
	}
	T && Oe();
	var d = null, f = /* @__PURE__ */ xt(() => {
		var e = n();
		return o(e) ? e : e == null ? [] : l(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, ir(v, p, s, t, r), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= oe, or(d, null, s)) : yn(d) : _n(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: ln(() => {
			p = Z(f);
			var e = p.length;
			let o = !1;
			T && je(s) === "[!" != (e === 0) && (s = Ae(), D(s), De(!1), o = !0);
			for (var l = /* @__PURE__ */ new Set(), u = j, v = Wt(), y = 0; y < e; y += 1) {
				T && E.nodeType === 8 && E.data === "]" && (s = E, o = !0, De(!1));
				var b = p[y], x = r(b, y), S = h ? null : c.get(x);
				S ? (S.v && jt(S.v, b), S.i && jt(S.i, y), v && u.unskip_effect(S.e)) : (S = ar(c, h ? s : tr ??= zt(), b, x, y, i, t, n), h || (S.e.f |= oe), c.set(x, S)), l.add(x);
			}
			if (e === 0 && a && !d && (h ? d = un(() => a(s)) : (d = un(() => a(tr ??= zt())), d.f |= oe)), e > l.size && ge("", "", ""), T && e > 0 && D(Ae()), !h) if (m.set(u, l), v) {
				for (let [e, t] of c) l.has(e) || u.skip_effect(t.e);
				u.oncommit(g), u.ondiscard(_);
			} else g(u);
			o && De(!0), Z(f);
		}),
		flags: t,
		items: c,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, T && (s = E);
}
function rr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function ir(e, t, n, r, i) {
	var a = (r & 8) != 0, o = t.length, s = e.items, c = rr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < o; v += 1) h = t[v], g = i(h, v), _ = s.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < o; v += 1) {
		if (h = t[v], g = i(h, v), _ = s.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (yn(_), a && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) if (_.f ^= oe, _ === c) or(_, null, n);
		else {
			var y = d ? d.next : c;
			_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), $(e, d, _), $(e, _, y), or(_, y, n), d = _, p = [], m = [], c = rr(d.next);
			continue;
		}
		if (_ !== c) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) or(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					$(e, S.prev, ee.next), $(e, d, S), $(e, ee, b), c = b, d = ee, --v, p = [], m = [];
				} else u.delete(_), or(_, c, n), $(e, _.prev, _.next), $(e, _, d === null ? e.effect.first : d.next), $(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; c !== null && c !== _;) (u ??= /* @__PURE__ */ new Set()).add(c), m.push(c), c = rr(c.next);
			if (c === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, c = rr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (er(e, l(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (c !== null || u !== void 0) {
		var C = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || C.push(_);
		for (; c !== null;) !(c.f & 8192) && c !== e.fallback && C.push(c), c = rr(c.next);
		var te = C.length;
		if (te > 0) {
			var ne = r & 4 && o === 0 ? n : null;
			if (a) {
				for (v = 0; v < te; v += 1) C[v].nodes?.a?.measure();
				for (v = 0; v < te; v += 1) C[v].nodes?.a?.fix();
			}
			$n(e, C, ne);
		}
	}
	a && Ve(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function ar(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? kt(n) : /* @__PURE__ */ At(n, !1, !1) : null, l = o & 2 ? kt(i) : null;
	return {
		v: c,
		i: l,
		e: un(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function or(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ L(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function $(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var sr = Symbol("is custom element"), cr = Symbol("is html"), lr = me ? "link" : "LINK";
function ur(e, t, n, r) {
	var i = dr(e);
	T && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === lr) || i[t] !== (i[t] = n) && (t === "loading" && (e[pe] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && pr(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function dr(e) {
	return e.__attributes ??= {
		[sr]: e.nodeName.includes("-"),
		[cr]: e.namespaceURI === a
	};
}
var fr = /* @__PURE__ */ new Map();
function pr(e) {
	var t = e.getAttribute("is") || e.nodeName, n = fr.get(t);
	if (n) return n;
	fr.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = f(i), r) r[o].set && n.push(o);
		i = h(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function mr(t, n, r = n) {
	var i = /* @__PURE__ */ new WeakSet();
	Zt(t, "input", async (e) => {
		var a = e ? t.defaultValue : t.value;
		if (a = hr(t) ? gr(a) : a, r(a), j !== null && i.add(j), await In(), a !== (a = n())) {
			var o = t.selectionStart, s = t.selectionEnd, c = t.value.length;
			if (t.value = a ?? "", s !== null) {
				var l = t.value.length;
				o === s && s === c && l > c ? (t.selectionStart = l, t.selectionEnd = l) : (t.selectionStart = o, t.selectionEnd = Math.min(s, l));
			}
		}
	}), (T && t.defaultValue !== t.value || Q(n) == null && t.value) && (r(hr(t) ? gr(t.value) : t.value), j !== null && i.add(j)), sn(() => {
		var r = n();
		if (t === document.activeElement) {
			var a = e ? Qe : j;
			if (i.has(a)) return;
		}
		hr(t) && r === gr(t.value) || t.type === "date" && !r && !t.value || r !== t.value && (t.value = r ?? "");
	});
}
function hr(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function gr(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/props.js
function _r(e, t, n) {
	var r = d(e, t);
	r && r.set && (e[t] = n, tn(() => {
		e[t] = null;
	}));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/legacy/lifecycle.js
function vr(e = !1) {
	let t = O, n = t.l.u;
	if (!n) return;
	let r = () => zn(t.s);
	if (e) {
		let e = 0, n = {}, i = /* @__PURE__ */ yt(() => {
			let r = !1, i = t.s;
			for (let e in i) i[e] !== n[e] && (n[e] = i[e], r = !0);
			return r && e++, e;
		});
		r = () => Z(i);
	}
	n.b.length && an(() => {
		yr(t, r), v(n.b);
	}), nn(() => {
		let e = Q(() => n.m.map(_));
		return () => {
			for (let t of e) typeof t == "function" && t();
		};
	}), n.a.length && nn(() => {
		yr(t, r), v(n.a);
	});
}
function yr(e, t) {
	if (e.l.s) for (let t of e.l.s) Z(t);
	t();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function br(e, n, r, i) {
	var a = !t || (r & 2) != 0, o = (r & 8) != 0, s = (r & 16) != 0, c = i, l = !0, u = () => (l && (l = !1, c = s ? Q(i) : i), c);
	let f;
	if (o) {
		var p = de in e || fe in e;
		f = d(e, n)?.set ?? (p && n in e ? (t) => e[n] = t : void 0);
	}
	var m, h = !1;
	o ? [m, h] = Ze(() => e[n]) : m = e[n], m === void 0 && i !== void 0 && (m = u(), f && (a && xe(n), f(m)));
	var g = a ? () => {
		var t = e[n];
		return t === void 0 ? u() : (l = !0, t);
	} : () => {
		var t = e[n];
		return t !== void 0 && (c = void 0), t === void 0 ? c : t;
	};
	if (a && !(r & 4)) return g;
	if (f) {
		var _ = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!a || !t || _ || h) && f(t ? g() : e), e) : g();
		});
	}
	var v = !1, y = (r & 1 ? yt : xt)(() => (v = !1, g()));
	o && Z(y);
	var b = U;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? Z(y) : a && o ? Ft(e) : e;
			return I(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return z && v || b.f & 16384 ? y.v : Z(y);
	});
}
var xr = /* @__PURE__ */ Xn("<div class=\"svelte-chat-message svelte-a1imdh\"><div class=\"svelte-chat-message-content svelte-a1imdh\"> </div> <div class=\"svelte-chat-message-time svelte-a1imdh\"> </div></div>"), Sr = /* @__PURE__ */ Xn("<div class=\"svelte-chat-container svelte-a1imdh\"><div class=\"svelte-chat-messages svelte-a1imdh\"></div> <div class=\"svelte-chat-input-container svelte-a1imdh\"><textarea placeholder=\"Type your message...\" rows=\"3\" class=\"svelte-a1imdh\"></textarea> <button class=\"svelte-a1imdh\">Send</button></div></div>");
function Cr(e, t) {
	Ie(t, !1);
	let n = br(t, "onMessage", 8, null), r = /* @__PURE__ */ At([]), i = /* @__PURE__ */ At("");
	function a() {
		if (!Z(i).trim()) return;
		let e = {
			id: Date.now().toString(),
			content: Z(i),
			role: "user",
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		};
		I(r, [...Z(r), e]), n() && n()(e), I(i, "");
	}
	function o(e) {
		e.key === "Enter" && !e.shiftKey && (e.preventDefault(), a());
	}
	var s = {
		sessionId: "",
		agentId: ""
	};
	vr();
	var c = Sr(), l = Vt(c);
	nr(l, 5, () => Z(r), (e) => e.id, (e, t) => {
		var n = xr(), r = Vt(n), i = Vt(r, !0);
		ke(r);
		var a = Ht(r, 2), o = Vt(a, !0);
		ke(a), ke(n), cn((e) => {
			ur(n, "data-role", (Z(t), Q(() => Z(t).role))), Qn(i, (Z(t), Q(() => Z(t).content))), Qn(o, e);
		}, [() => (Z(t), Q(() => new Date(Z(t).timestamp).toLocaleTimeString()))]), Zn(e, n);
	}), ke(l);
	var u = Ht(l, 2), d = Vt(u);
	qt(d), d.disabled = !1;
	var f = Ht(d, 2);
	return ke(u), ke(c), cn((e) => f.disabled = e, [() => (Z(i), Q(() => !Z(i).trim()))]), mr(d, () => Z(i), (e) => I(i, e)), Un("keypress", d, o), Un("click", f, a), Zn(e, c), _r(t, "sessionId", ""), _r(t, "agentId", ""), Le(s);
}
//#endregion
export { Cr as default };
