/* Pencarian sisi klien untuk wiki pemain. Tanpa dependensi. */
(function () {
	"use strict";

	var MAX_RESULTS = 20;
	var FAIL_TEXT = "Pencarian butuh situs dibuka lewat server.";
	var EMPTY_TEXT = "Tidak ada hasil.";
	var KIND_LABELS = {
		zone: "Zona",
		monster: "Monster",
		item: "Item",
		recipe: "Resep",
		buff: "Buff",
		node: "Titik Bahan",
		guide: "Panduan"
	};

	var input = document.getElementById("wiki-search");
	var list = document.getElementById("wiki-results");
	if (!input || !list) {
		return;
	}
	var root = document.body.getAttribute("data-root") || "";
	var entries = null;
	var loading = false;
	var failed = false;

	function fold(text) {
		return String(text).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
	}

	function clear() {
		while (list.firstChild) {
			list.removeChild(list.firstChild);
		}
	}

	function message(text) {
		clear();
		var li = document.createElement("li");
		li.className = "search-msg";
		li.textContent = text;
		list.appendChild(li);
		list.hidden = false;
	}

	function render(query) {
		var needle = fold(query).trim();
		if (!needle) {
			clear();
			list.hidden = true;
			return;
		}
		var hits = [];
		for (var i = 0; i < entries.length && hits.length < MAX_RESULTS; i++) {
			var entry = entries[i];
			if (fold(entry.name).indexOf(needle) !== -1 || fold(entry.id).indexOf(needle) !== -1) {
				hits.push(entry);
			}
		}
		if (hits.length === 0) {
			message(EMPTY_TEXT);
			return;
		}
		clear();
		hits.forEach(function (hit) {
			var li = document.createElement("li");
			var a = document.createElement("a");
			a.href = root + hit.path;
			var name = document.createElement("span");
			name.className = "search-name";
			name.textContent = hit.name;
			var kind = document.createElement("span");
			kind.className = "search-kind";
			kind.textContent = KIND_LABELS[hit.kind] || hit.kind;
			a.appendChild(name);
			a.appendChild(kind);
			li.appendChild(a);
			list.appendChild(li);
		});
		list.hidden = false;
	}

	function load(then) {
		if (entries) {
			then();
			return;
		}
		if (failed) {
			message(FAIL_TEXT);
			return;
		}
		if (loading) {
			return;
		}
		loading = true;
		fetch(root + "search.json")
			.then(function (response) {
				if (!response.ok) {
					throw new Error("http");
				}
				return response.json();
			})
			.then(function (data) {
				entries = data;
				loading = false;
				then();
			})
			.catch(function () {
				loading = false;
				failed = true;
				message(FAIL_TEXT);
			});
	}

	input.addEventListener("input", function () {
		load(function () {
			render(input.value);
		});
	});
	input.addEventListener("focus", function () {
		if (input.value) {
			load(function () {
				render(input.value);
			});
		}
	});
	input.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			list.hidden = true;
		}
	});
	document.addEventListener("click", function (event) {
		if (!list.contains(event.target) && event.target !== input) {
			list.hidden = true;
		}
	});
})();
