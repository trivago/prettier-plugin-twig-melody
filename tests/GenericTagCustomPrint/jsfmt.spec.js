run_spec(__dirname, ["melody"], {
    twigMultiTags: ["switch,case,default,endswitch"],
    twigMelodyPlugins: ["tests/switch-plugin"],
});
