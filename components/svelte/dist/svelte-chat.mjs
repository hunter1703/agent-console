//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region node_modules/svelte/src/internal/flags/index.js
var e = !1;
function t() {
	e = !0;
}
//#endregion
//#region node_modules/svelte/src/internal/flags/legacy.js
t();
//#endregion
//#region node_modules/svelte/src/constants.js
var n = {}, r = Symbol("uninitialized"), i = "http://www.w3.org/1999/xhtml", a = Array.isArray, o = Array.prototype.indexOf, s = Array.prototype.includes, c = Array.from, l = Object.defineProperty, u = Object.getOwnPropertyDescriptor, d = Object.getOwnPropertyDescriptors, f = Object.prototype, p = Array.prototype, m = Object.getPrototypeOf, h = () => {};
function g(e) {
	return e();
}
function _(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function v() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var y = 1024, b = 2048, x = 4096, S = 8192, ee = 16384, C = 32768, te = 1 << 25, ne = 65536, re = 1 << 19, ie = 1 << 20, ae = 1 << 25, oe = 65536, se = 1 << 21, ce = 1 << 22, le = 1 << 23, ue = Symbol("$state"), de = Symbol("legacy props"), fe = Symbol(""), pe = Symbol("attributes"), me = Symbol("text"), he = Symbol("form reset"), ge = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), _e = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function ve() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function ye(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function be(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function xe() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Se(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Ce() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function we(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function Te() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ee() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function De() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Oe() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function ke(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var w = !1;
function Ae(e) {
	w = e;
}
var T;
function E(e) {
	if (e === null) throw ke(), n;
	return T = e;
}
function je() {
	return E(/* @__PURE__ */ I(T));
}
function Me(e) {
	if (w) {
		if (/* @__PURE__ */ I(T) !== null) throw ke(), n;
		T = e;
	}
}
function Ne(e = !0) {
	for (var t = 0, n = T;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ I(n);
		e && n.remove(), n = i;
	}
}
function Pe(e) {
	if (!e || e.nodeType !== 8) throw ke(), n;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Fe(e) {
	return e === this.v;
}
function Ie(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Le(e) {
	return !Ie(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var D = null;
function Re(e) {
	D = e;
}
function ze(t, n = !1, r) {
	D = {
		p: D,
		i: !1,
		c: null,
		e: null,
		s: t,
		x: null,
		r: H,
		l: e && !n ? {
			s: null,
			u: null,
			$: []
		} : null
	};
}
function Be(e) {
	var t = D, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) an(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, D = t.p, e ?? {};
}
function Ve() {
	return !e || D !== null && D.l === null;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var O = [];
function He() {
	var e = O;
	O = [], _(e);
}
function Ue(e) {
	if (O.length === 0 && !bt) {
		var t = O;
		queueMicrotask(() => {
			t === O && He();
		});
	}
	O.push(e);
}
function We() {
	for (; O.length > 0;) He();
}
function Ge(e) {
	var t = H;
	if (t === null) return z.f |= le, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Ke(e, t);
}
function Ke(e, t) {
	if (!(t !== null && t.f & 16384)) {
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
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var qe = ~(b | x | y);
function k(e, t) {
	e.f = e.f & qe | t;
}
function Je(e) {
	e.f & 512 || e.deps === null ? k(e, y) : k(e, x);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Ye(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= oe, Ye(t.deps));
}
function Xe(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Ye(e.deps), k(e, y);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var Ze = !1;
function Qe(e) {
	var t = Ze;
	try {
		return Ze = !1, [e(), Ze];
	} finally {
		Ze = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function $e(e) {
	w && /* @__PURE__ */ Kt(e) !== null && Yt(e);
}
var et = !1;
function tt() {
	et || (et = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[he]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function nt(e) {
	var t = z, n = H;
	V(null), U(null);
	try {
		return e();
	} finally {
		V(t), U(n);
	}
}
function rt(e, t, n, r = n) {
	e.addEventListener(t, () => nt(n));
	let i = e[he];
	e[he] = i ? () => {
		i(), r(!0);
	} : () => r(!0), tt();
}
ne | re;
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function it(e, t, n, r) {
	let i = Ve() ? ct : dt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = H, c = at(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ke(e, s);
			}
			ot();
		}
	}
	var d = st();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ ut(e))).then(u).catch((e) => Ke(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), ot();
	}) : f();
}
function at() {
	var e = H, t = z, n = D, r = A;
	return function(i = !0) {
		U(e), V(t), Re(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ot(e = !0) {
	U(null), V(null), Re(null), e && A?.deactivate();
}
function st() {
	var e = H, t = e.b, n = A, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function ct(e) {
	var t = 2 | b;
	return H !== null && (H.f |= re), {
		ctx: D,
		deps: null,
		effects: null,
		equals: Fe,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: r,
		wv: 0,
		parent: H,
		ac: null
	};
}
var lt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function ut(e, t, n) {
	let i = H;
	i === null && ve();
	var a = void 0, o = Ft(r), s = !z, c = /* @__PURE__ */ new Set();
	return sn(() => {
		var t = H, n = v();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ge && n.reject(e);
			}).finally(ot);
		} catch (e) {
			n.reject(e), ot();
		}
		var r = A;
		if (s) {
			if (t.f & 32768) var l = st();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(lt);
			else for (let e of c.values()) e.reject(lt);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== lt && (r.activate(), t ? (o.f |= le, Lt(o, t)) : (o.f & 8388608 && (o.f ^= le), Lt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), nn(() => {
		for (let e of c) e.reject(lt);
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
/*#__NO_SIDE_EFFECTS__*/
function dt(e) {
	let t = /* @__PURE__ */ ct(e);
	return t.equals = Le, t;
}
function ft(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) hn(t[n]);
	}
}
function pt(e) {
	var t, n = H, i = e.parent;
	if (!R && i !== null && e.v !== r && i.f & 24576) return Oe(), e.v;
	U(i);
	try {
		e.f &= ~oe, ft(e), t = Nn(e);
	} finally {
		U(n);
	}
	return t;
}
function mt(e) {
	var t = pt(e);
	if (!e.equals(t) && (e.wv = An(), (!A?.is_fork || e.deps === null) && (A === null ? e.v = t : (A.capture(e, t, !0), vt?.capture(e, t, !0)), e.deps === null))) {
		k(e, y);
		return;
	}
	R || (j === null ? Je(e) : (tn() || A?.is_fork) && j.set(e, t));
}
function ht(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && nt(() => {
		t.ac.abort(ge), t.ac = null;
	}), t.fn !== null && (t.teardown = h), Fn(t, 0), pn(t));
}
function gt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && X(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var _t = null, A = null, vt = null, j = null, yt = null, bt = !1, xt = !1, St = null, Ct = null, wt = 0, Tt = 1, Et = class e {
	id = Tt++;
	#e = !1;
	linked = !0;
	#t = null;
	#n = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = /* @__PURE__ */ new Set();
	#a = 0;
	#o = /* @__PURE__ */ new Map();
	#s = null;
	#c = [];
	#l = [];
	#u = /* @__PURE__ */ new Set();
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Map();
	#p = /* @__PURE__ */ new Set();
	is_fork = !1;
	#m = !1;
	constructor() {
		_t === null ? _t = this : (_t.#n = this, this.#t = _t), _t = this;
	}
	#h() {
		if (this.is_fork) return !0;
		for (let n of this.#o.keys()) {
			for (var e = n, t = !1; e.parent !== null;) {
				if (this.#f.has(e)) {
					t = !0;
					break;
				}
				e = e.parent;
			}
			if (!t) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#f.has(e) || this.#f.set(e, {
			d: [],
			m: []
		}), this.#p.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#f.get(e);
		if (n) {
			this.#f.delete(e);
			for (var r of n.d) k(r, b), t(r);
			for (r of n.m) k(r, x), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, wt++ > 1e3 && (this.#x(), Ot());
		for (let e of this.#u) this.#d.delete(e), k(e, b), this.schedule(e);
		for (let e of this.#d) k(e, x), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = St = [], r = [], i = Ct = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Mt(e), this.#h() || this.discard(), t;
		}
		if (A = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (St = null, Ct = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) jt(e, t);
			i.length > 0 && A.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), vt = this, kt(r), kt(n), vt = null, this.#s?.resolve();
		var s = A;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && s.#g();
	}
	#_(e, t, n) {
		e.f ^= y;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= y : i & 4 ? t.push(r) : jn(r) && (i & 16 && this.#d.add(r), X(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#v() {
		for (var e = this.#t; e !== null;) {
			if (!e.is_fork) {
				for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
			}
			e = e.#t;
		}
		return null;
	}
	#y(e) {
		for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
		for (let [t, n] of e.async_deriveds) {
			let e = this.async_deriveds.get(t);
			e && n.promise.then(e.resolve).catch(e.reject);
		}
		e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
		let t = (e) => {
			var n = e.reactions;
			if (n !== null && !(e.f & 2 && !(e.f & 6144))) for (let e of n) {
				var r = e.f;
				if (r & 2) t(e);
				else {
					var i = e;
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), k(i, b), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), A = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Xe(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== r && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), j?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		A = this;
	}
	deactivate() {
		A = null, j = null;
	}
	flush() {
		try {
			xt = !0, A = this, this.#g();
		} finally {
			wt = 0, yt = null, St = null, Ct = null, xt = !1, A = null, j = null, N.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(lt);
		this.#x(), this.#s?.resolve();
	}
	register_created_effect(e) {
		this.#l.push(e);
	}
	increment(e, t) {
		if (this.#a += 1, e) {
			let e = this.#o.get(t) ?? 0;
			this.#o.set(t, e + 1);
		}
	}
	decrement(e, t) {
		if (--this.#a, e) {
			let e = this.#o.get(t) ?? 0;
			e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
		}
		this.#m || (this.#m = !0, Ue(() => {
			this.#m = !1, this.linked && this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#u.add(t);
		for (let e of t) this.#d.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#r.add(e);
	}
	ondiscard(e) {
		this.#i.add(e);
	}
	settled() {
		return (this.#s ??= v()).promise;
	}
	static ensure() {
		if (A === null) {
			let t = A = new e();
			!xt && !bt && Ue(() => {
				t.#e || t.flush();
			});
		}
		return A;
	}
	apply() {
		j = null;
	}
	schedule(e) {
		if (yt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (St !== null && t === H && (z === null || !(z.f & 2))) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= y;
			}
		}
		this.#c.push(t);
	}
	#x() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? _t = e : t.#t = e, this.linked = !1;
		}
	}
};
function Dt(e) {
	var t = bt;
	bt = !0;
	try {
		var n;
		for (e && (A !== null && !A.is_fork && A.flush(), n = e());;) {
			if (We(), A === null) return n;
			A.flush();
		}
	} finally {
		bt = t;
	}
}
function Ot() {
	try {
		Ce();
	} catch (e) {
		Ke(e, yt);
	}
}
var M = null;
function kt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && jn(r) && (M = /* @__PURE__ */ new Set(), X(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && _n(r), M?.size > 0)) {
				N.clear();
				for (let e of M) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) M.has(n) && (M.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || X(n);
					}
				}
				M.clear();
			}
		}
		M = null;
	}
}
function At(e) {
	A.schedule(e);
}
function jt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), k(e, y);
		for (var n = e.first; n !== null;) jt(n, t), n = n.next;
	}
}
function Mt(e) {
	k(e, y);
	for (var t = e.first; t !== null;) Mt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Nt = /* @__PURE__ */ new Set(), N = /* @__PURE__ */ new Map(), Pt = !1;
function Ft(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Fe,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function P(e, t) {
	let n = Ft(e, t);
	return En(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function It(t, n = !1, r = !0) {
	let i = Ft(t);
	return n || (i.equals = Le), e && r && D !== null && D.l !== null && (D.l.s ??= []).push(i), i;
}
function F(e, t, n = !1) {
	return z !== null && (!B || z.f & 131072) && Ve() && z.f & 4325394 && (W === null || !W.has(e)) && De(), Lt(e, n ? Vt(t) : t, Ct);
}
function Lt(e, t, n = null) {
	if (!e.equals(t)) {
		N.set(e, R ? t : e.v);
		var r = Et.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && pt(t), j === null && Je(t);
		}
		e.wv = An(), Bt(e, b, n), Ve() && H !== null && H.f & 1024 && !(H.f & 96) && (q === null ? Dn([e]) : q.push(e)), !r.is_fork && Nt.size > 0 && !Pt && Rt();
	}
	return t;
}
function Rt() {
	Pt = !1;
	for (let e of Nt) {
		e.f & 1024 && k(e, x);
		let t;
		try {
			t = jn(e);
		} catch {
			t = !0;
		}
		t && X(e);
	}
	Nt.clear();
}
function zt(e) {
	F(e, e.v + 1);
}
function Bt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ve(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === H)) {
			var l = (c & b) === 0;
			if (l && k(s, t), c & 131072) Nt.add(s);
			else if (c & 2) {
				var u = s;
				j?.delete(u), c & 65536 || (c & 512 && (H === null || !(H.f & 2097152)) && (s.f |= oe), Bt(u, x, n));
			} else if (l) {
				var d = s;
				c & 16 && M !== null && M.add(d), n === null ? At(d) : n.push(d);
			}
		}
	}
}
function Vt(e) {
	if (typeof e != "object" || !e || ue in e) return e;
	let t = m(e);
	if (t !== f && t !== p) return e;
	var n = /* @__PURE__ */ new Map(), i = a(e), o = /* @__PURE__ */ P(0), s = null, c = Y, l = (e) => {
		if (Y === c) return e();
		var t = z, n = Y;
		V(null), kn(c);
		var r = e();
		return V(t), kn(n), r;
	};
	return i && n.set("length", /* @__PURE__ */ P(e.length, s)), new Proxy(e, {
		defineProperty(e, t, r) {
			(!("value" in r) || r.configurable === !1 || r.enumerable === !1 || r.writable === !1) && Te();
			var i = n.get(t);
			return i === void 0 ? l(() => {
				var e = /* @__PURE__ */ P(r.value, s);
				return n.set(t, e), e;
			}) : F(i, r.value, !0), !0;
		},
		deleteProperty(e, t) {
			var i = n.get(t);
			if (i === void 0) {
				if (t in e) {
					let e = l(() => /* @__PURE__ */ P(r, s));
					n.set(t, e), zt(o);
				}
			} else F(i, r), zt(o);
			return !0;
		},
		get(t, i, a) {
			if (i === ue) return e;
			var o = n.get(i), c = i in t;
			if (o === void 0 && (!c || u(t, i)?.writable) && (o = l(() => /* @__PURE__ */ P(Vt(c ? t[i] : r), s)), n.set(i, o)), o !== void 0) {
				var d = Z(o);
				return d === r ? void 0 : d;
			}
			return Reflect.get(t, i, a);
		},
		getOwnPropertyDescriptor(e, t) {
			var i = Reflect.getOwnPropertyDescriptor(e, t);
			if (i && "value" in i) {
				var a = n.get(t);
				a && (i.value = Z(a));
			} else if (i === void 0) {
				var o = n.get(t), s = o?.v;
				if (o !== void 0 && s !== r) return {
					enumerable: !0,
					configurable: !0,
					value: s,
					writable: !0
				};
			}
			return i;
		},
		has(e, t) {
			if (t === ue) return !0;
			var i = n.get(t), a = i !== void 0 && i.v !== r || Reflect.has(e, t);
			return (i !== void 0 || H !== null && (!a || u(e, t)?.writable)) && (i === void 0 && (i = l(() => /* @__PURE__ */ P(a ? Vt(e[t]) : r, s)), n.set(t, i)), Z(i) === r) ? !1 : a;
		},
		set(e, t, a, c) {
			var d = n.get(t), f = t in e;
			if (i && t === "length") for (var p = a; p < d.v; p += 1) {
				var m = n.get(p + "");
				m === void 0 ? p in e && (m = l(() => /* @__PURE__ */ P(r, s)), n.set(p + "", m)) : F(m, r);
			}
			if (d === void 0) (!f || u(e, t)?.writable) && (d = l(() => /* @__PURE__ */ P(void 0, s)), F(d, Vt(a)), n.set(t, d));
			else {
				f = d.v !== r;
				var h = l(() => Vt(a));
				F(d, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, t);
			if (g?.set && g.set.call(c, a), !f) {
				if (i && typeof t == "string") {
					var _ = n.get("length"), v = Number(t);
					Number.isInteger(v) && v >= _.v && F(_, v + 1);
				}
				zt(o);
			}
			return !0;
		},
		ownKeys(e) {
			Z(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = n.get(e);
				return t === void 0 || t.v !== r;
			});
			for (var [i, a] of n) a.v !== r && !(i in e) && t.push(i);
			return t;
		},
		setPrototypeOf() {
			Ee();
		}
	});
}
var Ht, Ut, Wt;
function Gt(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Kt(e) {
	return Ut.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function I(e) {
	return Wt.call(e);
}
function qt(e, t) {
	if (!w) return /* @__PURE__ */ Kt(e);
	var n = /* @__PURE__ */ Kt(T);
	if (n === null) n = T.appendChild(Gt());
	else if (t && n.nodeType !== 3) {
		var r = Gt();
		return n?.before(r), E(r), r;
	}
	return t && Qt(n), E(n), n;
}
function Jt(e, t = 1, n = !1) {
	let r = w ? T : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ I(r);
	if (!w) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = Gt();
			return r === null ? i?.after(a) : r.before(a), E(a), a;
		}
		Qt(r);
	}
	return E(r), r;
}
function Yt(e) {
	e.textContent = "";
}
function Xt() {
	return !1;
}
function Zt(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function Qt(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function $t(e) {
	H === null && (z === null && Se(e), xe()), R && be(e);
}
function en(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function L(e, t) {
	var n = H;
	n !== null && n.f & 8192 && (e |= S);
	var r = {
		ctx: D,
		deps: null,
		nodes: null,
		f: e | b | 512,
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
	A?.register_created_effect(r);
	var i = r;
	if (e & 4) St === null ? Et.ensure().schedule(r) : St.push(r);
	else if (t !== null) {
		try {
			X(r);
		} catch (e) {
			throw hn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= ne));
	}
	if (i !== null && (i.parent = n, n !== null && en(i, n), z !== null && z.f & 2 && !(e & 64))) {
		var a = z;
		(a.effects ??= []).push(i);
	}
	return r;
}
function tn() {
	return z !== null && !B;
}
function nn(e) {
	let t = L(8, null);
	return k(t, y), t.teardown = e, t;
}
function rn(e) {
	$t("$effect");
	var t = H.f;
	if (!z && t & 32 && D !== null && !D.i) {
		var n = D;
		(n.e ??= []).push(e);
	} else return an(e);
}
function an(e) {
	return L(4 | ie, e);
}
function on(e) {
	return $t("$effect.pre"), L(8 | ie, e);
}
function sn(e) {
	return L(ce | re, e);
}
function cn(e, t = 0) {
	return L(8 | t, e);
}
function ln(e, t = [], n = [], r = []) {
	it(r, t, n, (t) => {
		L(8, () => {
			e(...t.map(Z));
		});
	});
}
function un(e, t = 0) {
	return L(16 | t, e);
}
function dn(e) {
	return L(32 | re, e);
}
function fn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = R, n = z;
		Tn(!0), V(null);
		try {
			t.call(null);
		} finally {
			Tn(e), V(n);
		}
	}
}
function pn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && nt(() => {
			e.abort(ge);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : hn(n, t), n = r;
	}
}
function mn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || hn(t), t = n;
	}
}
function hn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (gn(e.nodes.start, e.nodes.end), n = !0), e.f |= te, pn(e, t && !n), Fn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	fn(e), e.f ^= te, e.f |= ee;
	var i = e.parent;
	i !== null && i.first !== null && _n(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function gn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ I(e);
		e.remove(), e = n;
	}
}
function _n(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function vn(e, t, n = !0) {
	var r = [];
	yn(e, r, !0);
	var i = () => {
		n && hn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function yn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= S;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				yn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function bn(e) {
	xn(e, !0);
}
function xn(e, t) {
	if (e.f & 8192) {
		e.f ^= S, e.f & 1024 || (k(e, b), Et.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			xn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Sn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ I(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Cn = null, wn = !1, R = !1;
function Tn(e) {
	R = e;
}
var z = null, B = !1;
function V(e) {
	z = e;
}
var H = null;
function U(e) {
	H = e;
}
var W = null;
function En(e) {
	z !== null && (W ??= /* @__PURE__ */ new Set()).add(e);
}
var G = null, K = 0, q = null;
function Dn(e) {
	q = e;
}
var On = 1, J = 0, Y = J;
function kn(e) {
	Y = e;
}
function An() {
	return ++On;
}
function jn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~oe), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (jn(a) && mt(a), a.wv > e.wv) return !0;
		}
		t & 512 && j === null && k(e, y);
	}
	return !1;
}
function Mn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(W !== null && W.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Mn(a, t, !1) : t === a && (n ? k(a, b) : a.f & 1024 && k(a, x), At(a));
	}
}
function Nn(e) {
	var t = G, n = K, r = q, i = z, a = W, o = D, s = B, c = Y, l = e.f;
	G = null, K = 0, q = null, z = l & 96 ? null : e, W = null, Re(e.ctx), B = !1, Y = ++J, e.ac !== null && (nt(() => {
		e.ac.abort(ge);
	}), e.ac = null);
	try {
		e.f |= se;
		var u = e.fn, d = u();
		e.f |= C;
		var f = e.deps, p = A?.is_fork;
		if (G !== null) {
			var m;
			if (p || Fn(e, K), f !== null && K > 0) for (f.length = K + G.length, m = 0; m < G.length; m++) f[K + m] = G[m];
			else e.deps = f = G;
			if (tn() && e.f & 512) for (m = K; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && K < f.length && (Fn(e, K), f.length = K);
		if (Ve() && q !== null && !B && f !== null && !(e.f & 6146)) for (m = 0; m < q.length; m++) Mn(q[m], e);
		if (i !== null && i !== e) {
			if (J++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = J;
			if (t !== null) for (let e of t) e.rv = J;
			q !== null && (r === null ? r = q : r.push(...q));
		}
		return e.f & 8388608 && (e.f ^= le), d;
	} catch (e) {
		return Ge(e);
	} finally {
		e.f ^= se, G = t, K = n, q = r, z = i, W = a, Re(o), B = s, Y = c;
	}
}
function Pn(e, t) {
	let n = t.reactions;
	if (n !== null) {
		var i = o.call(n, e);
		if (i !== -1) {
			var a = n.length - 1;
			a === 0 ? n = t.reactions = null : (n[i] = n[a], n.pop());
		}
	}
	if (n === null && t.f & 2 && (G === null || !s.call(G, t))) {
		var c = t;
		c.f & 512 && (c.f ^= 512, c.f &= ~oe), c.v !== r && Je(c), c.ac !== null && nt(() => {
			c.ac.abort(ge), c.ac = null, k(c, b);
		}), ht(c), Fn(c, 0);
	}
}
function Fn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Pn(e, n[r]);
}
function X(e) {
	var t = e.f;
	if (!(t & 16384)) {
		k(e, y);
		var n = H, r = wn;
		H = e, wn = !(t & 96);
		try {
			t & 16777232 ? mn(e) : pn(e), fn(e);
			var i = Nn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = On;
		} finally {
			wn = r, H = n;
		}
	}
}
async function In() {
	await Promise.resolve(), Dt();
}
function Z(e) {
	var t = !!(e.f & 2);
	if (Cn?.add(e), z !== null && !B && !(H !== null && H.f & 16384) && (W === null || !W.has(e))) {
		var n = z.deps;
		if (z.f & 2097152) e.rv < J && (e.rv = J, G === null && n !== null && n[K] === e ? K++ : G === null ? G = [e] : G.push(e));
		else {
			z.deps ??= [], s.call(z.deps, e) || z.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [z] : s.call(r, z) || r.push(z);
		}
	}
	if (R && N.has(e)) return N.get(e);
	if (t) {
		var i = e;
		if (R) {
			var a = i.v;
			return (!(i.f & 1024) && i.reactions !== null || Rn(i)) && (a = pt(i)), N.set(i, a), a;
		}
		var o = !(i.f & 512) && !B && z !== null && (wn || !!(z.f & 512)), c = (i.f & C) === 0;
		jn(i) && (o && (i.f |= 512), mt(i)), o && !c && (gt(i), Ln(i));
	}
	if (j?.has(e)) return j.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Ln(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (gt(t), Ln(t));
}
function Rn(e) {
	if (e.v === r) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (N.has(t) || t.f & 2 && Rn(t)) return !0;
	return !1;
}
function Q(e) {
	var t = B;
	try {
		return B = !0, e();
	} finally {
		B = t;
	}
}
function zn(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (ue in e) Bn(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && ue in n && Bn(n);
		}
	}
}
function Bn(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			Bn(e[n], t);
		} catch {}
		let n = m(e);
		if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
			let t = d(n);
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
		if (r.capture || Gn.call(t, e), !e.cancelBubble) return nt(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ue(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function Un(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = Hn(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && nn(() => {
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
		var u = i.indexOf(t);
		if (u === -1) return;
		c <= u && (o = c);
	}
	if (a = i[o] || e.target, a !== t) {
		l(e, "currentTarget", {
			configurable: !0,
			get() {
				return a || n;
			}
		});
		var d = z, f = H;
		V(null), U(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[Vn]?.[r];
					h != null && (!a.disabled || e.target === a) && h.call(a, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				o++, a = o < i.length ? i[o] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[Vn] = t, delete e.currentTarget, V(d), U(f);
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
	var t = Zt("template");
	return t.innerHTML = qn(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Yn(e, t) {
	var n = H;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Xn(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (w) return Yn(T, null), T;
		i === void 0 && (i = Jn(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Kt(i)));
		var t = r || Ht ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Kt(t), s = t.lastChild;
			Yn(o, s);
		} else Yn(t, t);
		return t;
	};
}
function Zn(e, t) {
	if (w) {
		var n = H;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = T), je();
		return;
	}
	e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
function Qn(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[me] ??= e.nodeValue) && (e[me] = n, e.nodeValue = `${n}`);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function $n(e, t, n) {
	for (var r = [], i = t.length, a, o = t.length, s = 0; s < i; s++) {
		let n = t[s];
		vn(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					er(e, c(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --o;
		}, !1);
	}
	if (o === 0) {
		var l = r.length === 0 && n !== null;
		if (l) {
			var u = n, d = u.parentNode;
			Yt(d), d.append(u), e.items.clear();
		}
		er(e, t, !l);
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
		r?.has(a) ? (a.f |= ae, Sn(a, document.createDocumentFragment())) : hn(t[i], n);
	}
}
var tr;
function nr(e, t, n, r, i, o = null) {
	var s = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		s = w ? E(/* @__PURE__ */ Kt(u)) : u.appendChild(Gt());
	}
	w && je();
	var d = null, f = /* @__PURE__ */ dt(() => {
		var e = n();
		return a(e) ? e : e == null ? [] : c(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, ir(v, p, s, t, r), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= ae, or(d, null, s)) : bn(d) : vn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: un(() => {
			p = Z(f);
			var e = p.length;
			let a = !1;
			w && Pe(s) === "[!" != (e === 0) && (s = Ne(), E(s), Ae(!1), a = !0);
			for (var c = /* @__PURE__ */ new Set(), u = A, v = Xt(), y = 0; y < e; y += 1) {
				w && T.nodeType === 8 && T.data === "]" && (s = T, a = !0, Ae(!1));
				var b = p[y], x = r(b, y), S = h ? null : l.get(x);
				S ? (S.v && Lt(S.v, b), S.i && Lt(S.i, y), v && u.unskip_effect(S.e)) : (S = ar(l, h ? s : tr ??= Gt(), b, x, y, i, t, n), h || (S.e.f |= ae), l.set(x, S)), c.add(x);
			}
			if (e === 0 && o && !d && (h ? d = dn(() => o(s)) : (d = dn(() => o(tr ??= Gt())), d.f |= ae)), e > c.size && ye("", "", ""), w && e > 0 && E(Ne()), !h) {
				if (m.set(u, c), v) {
					for (let [e, t] of l) c.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			a && Ae(!0), Z(f);
		}),
		flags: t,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, w && (s = T);
}
function rr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function ir(e, t, n, r, i) {
	var a = !!(r & 8), o = t.length, s = e.items, l = rr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < o; v += 1) h = t[v], g = i(h, v), _ = s.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < o; v += 1) {
		if (h = t[v], g = i(h, v), _ = s.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (bn(_), a && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= ae, _ === l) or(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), $(e, d, _), $(e, _, y), or(_, y, n), d = _, p = [], m = [], l = rr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) or(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					$(e, S.prev, ee.next), $(e, d, S), $(e, ee, b), l = b, d = ee, --v, p = [], m = [];
				} else u.delete(_), or(_, l, n), $(e, _.prev, _.next), $(e, _, d === null ? e.effect.first : d.next), $(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = rr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = rr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (er(e, c(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var C = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || C.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && C.push(l), l = rr(l.next);
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
	a && Ue(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function ar(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Ft(n) : /* @__PURE__ */ It(n, !1, !1) : null, l = o & 2 ? Ft(i) : null;
	return {
		v: c,
		i: l,
		e: dn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function or(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ I(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function $(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var sr = Symbol("is custom element"), cr = Symbol("is html"), lr = _e ? "link" : "LINK";
function ur(e, t, n, r) {
	var i = dr(e);
	w && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === lr) || i[t] !== (i[t] = n) && (t === "loading" && (e[fe] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && pr(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function dr(e) {
	return e[pe] ??= {
		[sr]: e.nodeName.includes("-"),
		[cr]: e.namespaceURI === i
	};
}
var fr = /* @__PURE__ */ new Map();
function pr(e) {
	var t = e.getAttribute("is") || e.nodeName, n = fr.get(t);
	if (n) return n;
	fr.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = d(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.push(o);
		i = m(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function mr(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	rt(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = hr(e) ? gr(a) : a, n(a), A !== null && r.add(A), await In(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (w && e.defaultValue !== e.value || Q(t) == null && e.value) && (n(hr(e) ? gr(e.value) : e.value), A !== null && r.add(A)), cn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = A;
			if (r.has(i)) return;
		}
		hr(e) && n === gr(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
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
	var r = u(e, t);
	r && r.set && (e[t] = n, nn(() => {
		e[t] = null;
	}));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/legacy/lifecycle.js
function vr(e = !1) {
	let t = D, n = t.l.u;
	if (!n) return;
	let r = () => zn(t.s);
	if (e) {
		let e = 0, n = {}, i = /* @__PURE__ */ ct(() => {
			let r = !1, i = t.s;
			for (let e in i) i[e] !== n[e] && (n[e] = i[e], r = !0);
			return r && e++, e;
		});
		r = () => Z(i);
	}
	n.b.length && on(() => {
		yr(t, r), _(n.b);
	}), rn(() => {
		let e = Q(() => n.m.map(g));
		return () => {
			for (let t of e) typeof t == "function" && t();
		};
	}), n.a.length && rn(() => {
		yr(t, r), _(n.a);
	});
}
function yr(e, t) {
	if (e.l.s) for (let t of e.l.s) Z(t);
	t();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function br(t, n, r, i) {
	var a = !e || !!(r & 2), o = !!(r & 8), s = !!(r & 16), c = i, l = !0, d = void 0, f = () => s && a ? (d ??= /* @__PURE__ */ ct(i), Z(d)) : (l && (l = !1, c = s ? Q(i) : i), c);
	let p;
	if (o) {
		var m = ue in t || de in t;
		p = u(t, n)?.set ?? (m && n in t ? (e) => t[n] = e : void 0);
	}
	var h, g = !1;
	o ? [h, g] = Qe(() => t[n]) : h = t[n], h === void 0 && i !== void 0 && (h = f(), p && (a && we(n), p(h)));
	var _ = a ? () => {
		var e = t[n];
		return e === void 0 ? f() : (l = !0, e);
	} : () => {
		var e = t[n];
		return e !== void 0 && (c = void 0), e === void 0 ? c : e;
	};
	if (a && !(r & 4)) return _;
	if (p) {
		var v = t.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!a || !t || v || g) && p(t ? _() : e), e) : _();
		});
	}
	var y = !1, b = (r & 1 ? ct : dt)(() => (y = !1, _()));
	o && Z(b);
	var x = H;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? Z(b) : a && o ? Vt(e) : e;
			return F(b, n), y = !0, c !== void 0 && (c = n), e;
		}
		return R && y || x.f & 16384 ? b.v : Z(b);
	});
}
var xr = /* @__PURE__ */ Xn("<div class=\"svelte-chat-message svelte-a1imdh\"><div class=\"svelte-chat-message-content svelte-a1imdh\"> </div> <div class=\"svelte-chat-message-time svelte-a1imdh\"> </div></div>"), Sr = /* @__PURE__ */ Xn("<div class=\"svelte-chat-container svelte-a1imdh\"><div class=\"svelte-chat-messages svelte-a1imdh\"></div> <div class=\"svelte-chat-input-container svelte-a1imdh\"><textarea placeholder=\"Type your message...\" rows=\"3\" class=\"svelte-a1imdh\"></textarea> <button class=\"svelte-a1imdh\">Send</button></div></div>");
function Cr(e, t) {
	ze(t, !1);
	let n = br(t, "onMessage", 8, null), r = /* @__PURE__ */ It([]), i = /* @__PURE__ */ It("");
	function a() {
		if (!Z(i).trim()) return;
		let e = {
			id: Date.now().toString(),
			content: Z(i),
			role: "user",
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		};
		F(r, [...Z(r), e]), n() && n()(e), F(i, "");
	}
	function o(e) {
		e.key === "Enter" && !e.shiftKey && (e.preventDefault(), a());
	}
	var s = {
		sessionId: "",
		agentId: ""
	};
	vr();
	var c = Sr(), l = qt(c);
	nr(l, 5, () => Z(r), (e) => e.id, (e, t) => {
		var n = xr(), r = qt(n), i = qt(r, !0);
		Me(r);
		var a = Jt(r, 2), o = qt(a, !0);
		Me(a), Me(n), ln((e) => {
			ur(n, "data-role", (Z(t), Q(() => Z(t).role))), Qn(i, (Z(t), Q(() => Z(t).content))), Qn(o, e);
		}, [() => (Z(t), Q(() => new Date(Z(t).timestamp).toLocaleTimeString()))]), Zn(e, n);
	}), Me(l);
	var u = Jt(l, 2), d = qt(u);
	$e(d), d.disabled = !1;
	var f = Jt(d, 2);
	return Me(u), Me(c), ln((e) => f.disabled = e, [() => (Z(i), Q(() => !Z(i).trim()))]), mr(d, () => Z(i), (e) => F(i, e)), Un("keypress", d, o), Un("click", f, a), Zn(e, c), _r(t, "sessionId", ""), _r(t, "agentId", ""), Be(s);
}
//#endregion
export { Cr as default };
