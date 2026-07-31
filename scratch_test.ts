const quizCsv = "\"stage_id\",\"stage_title\",\"Pool\",\"context_text\",\"require_color\",\"true_color\",\"item\",\"allow_colors\",\"deny_colors\",\"deny_color_feedback_key\",\"deny_items\",\"must_have\",\"required_slots\",\"target_outfit\",\"target_outfit_ids\",\"limited_color\",\"limited_color_max\",\"limited_color_feedback_key\"\n\"1\",\"\u8457\",\"1\",\"\uff0c\u8d70\u8d77\u8def\u4f86\u7279\u5225\u8f15\u9b06\u81ea\u5728\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u70cf\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u978b\",\"\",\"\",\"\",\"\",\"\u65e5\u5e38\",\"clothes,pants,shoes\",\"clothes:\u77ed\u886b@\u9ec3\u8272;pants:\u77ed\u8932@\u9ec3\u8272;shoes:\u978b@\u767d\u8272\",\"clothes:short_shirt@yellow;pants:shorts@yellow;shoes:shoes@white\",\"\",\"\",\"\"\n\"2\",\"\u8457\",\"1\",\"\uff0c\u9ad4\u9a57\u505a\u64c2\u8336\u548c\u85cd\u67d3\uff0c\u50cf\u662f\u7a7f\u8d8a\u5230\u65e9\u6642\u5ba2\u5e84\u3002\",\"X\",\"X\",\"\u85cd\u886b\",\"\",\"\",\"\",\"\",\"\u85cd\u886b\",\"clothes,pants,shoes\",\"clothes:\u85cd\u886b@\u7121;pants:\u9577\u8932@\u70cf\u8272;shoes:\u978b@\u70cf\u8272\",\"clothes:hakka_shirt@none;pants:long_pants@black;shoes:shoes@black\",\"\",\"\",\"\"\n\"3\",\"\u6234\",\"1\",\"\uff0c\u6700\u9069\u5408\u7528\u4f86\u64cb\u592a\u967d\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u70cf\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u5e3d\u4ed4\",\"\",\"\",\"\",\"\",\"\u65e5\u5e38\",\"clothes,pants,shoes,head\",\"clothes:\u77ed\u886b@\u9ec3\u8272;pants:\u77ed\u8932@\u9ec3\u8272;shoes:\u978b@\u767d\u8272;head:\u5e3d\u4ed4@\u9ec3\u8272\",\"clothes:short_shirt@yellow;pants:shorts@yellow;shoes:shoes@white;head:hat@yellow\",\"\",\"\",\"\"\n\"4\",\"\u8457\",\"1\",\"\uff0c\u5728\u6236\u5916\u770b\u87a2\u706b\u87f2\u4e5f\u4e0d\u6015\u88ab\u868a\u5b50\u53ee\u3002\",\"\u662f\",\"X, \u70cf\u8272, \u540a\u83dc\u8272\",\"\u9577\u8932\",\"\",\"\",\"\",\"\",\"\u8cde\u87a2,  \u6697, \u71b1\",\"clothes,pants,shoes\",\"clothes:\u77ed\u886b@\u540a\u83dc\u8272;pants:\u9577\u8932@\u540a\u83dc\u8272;shoes:\u978b@\u70cf\u8272\",\"clothes:short_shirt@dark_green;pants:long_pants@dark_green;shoes:shoes@black\",\"\",\"\",\"\"\n\"5\",\"\u8457\",\"1\",\"\uff0c\u4e0b\u96e8\u5929\u8173\u4e0d\u6703\u6fd5\uff0c\u65b9\u4fbf\u53c8\u8212\u9069\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u70cf\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u6c34\u9774\u7b52\",\"\",\"\",\"\",\"\",\"rain\",\"clothes,pants,shoes\",\"clothes:\u77ed\u886b@\u9ec3\u8272;pants:\u9577\u8932@\u70cf\u8272;shoes:\u6c34\u9774\u7b52@\u9ec3\u8272\",\"clothes:short_shirt@yellow;pants:long_pants@black;shoes:rain_boots@yellow\",\"\",\"\",\"\"\n\"6\",\"\u6234\",\"1\",\"\uff0c\u5728\u6cf3\u6c60\u88e1\u88e1\u770b\u8457\u771f\u4eae\u773c\uff0c\u5b89\u5168\u53c8\u751f\u8da3\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u6cc5\u6c34\u5e3d\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\",\"\",\"\",\"\u4eae, water, \u71b1\",\"clothes,pants,head\",\"clothes:\u6cc5\u6c34\u886b@\u9ec3\u8272;pants:\u77ed\u8932@\u9ec3\u8272;head:\u6cc5\u6c34\u5e3d@\u9ec3\u8272\",\"clothes:swimsuit@yellow;pants:shorts@yellow;head:swim_cap@yellow\",\"\",\"\",\"\"\n\"7\",\"\u8457\",\"1\",\"\uff0c\u9019\u6a23\u6e9c\u76f4\u6392\u8f2a\u5c31\u4e0d\u6015\u8dcc\u5012\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u70cf\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u819d\u982d\u843d\u4ed4\",\"\",\"\",\"\",\"\",\"\u904b\u52d5\",\"clothes,pants,shoes,knee\",\"clothes:\u77ed\u886b@\u9ec3\u8272;pants:\u77ed\u8932@\u9ec3\u8272;shoes:\u978b@\u767d\u8272;knee:\u819d\u982d\u843d\u4ed4@\u9ec3\u8272\",\"clothes:short_shirt@yellow;pants:shorts@yellow;shoes:shoes@white;knee:knee_protector@yellow\",\"\",\"\",\"\"\n\"8\",\"\u8457\",\"2\",\"\uff0c\u7a7f\u53bb\u53c3\u52a0\u5c31\u8077\u9762\u8a66\uff0c\u7d66\u4eba\u7559\u4e0b\u5c08\u696d\u5f97\u9ad4\u7684\u7b2c\u4e00\u5370\u8c61\u3002\",\"\u662f\",\"\u767d\u8272, \u70cf\u8272\",\"\u77ed\u886b, \u88d9, \u9577\u8932, \u978b\",\"\",\"\",\"\",\"\",\"\u6b63\u5f0f\",\"clothes,pants,shoes\",\"clothes:\u77ed\u886b@\u767d\u8272;pants:\u9577\u8932@\u70cf\u8272;shoes:\u978b@\u70cf\u8272\",\"clothes:short_shirt@white;pants:long_pants@black;shoes:shoes@black\",\"\",\"\",\"\"\n\"9\",\"\u8457, \u6234\",\"2\",\"\uff0c\u53bb\u53c3\u52a0\u793e\u5340\u5927\u6383\u9664\uff0c\u4e0d\u6015\u9ad2\u6c61\u53c8\u8212\u9069\u3002\",\"\u662f\",\"\u70cf\u8272, \u540a\u83dc\u8272, \u67d1\u4ed4\u8272\",\"\u77ed\u886b, \u77ed\u8932, \u9577\u8932, \u5e3d\u4ed4, \u978b, \u6c34\u9774\u7b52\",\"\u70cf\u8272, \u540a\u83dc\u8272, \u67d1\u4ed4\u8272\",\"\u767d\u8272, \u9ec3\u8272, \u7d05\u8272\u82b1\u5716\u6848\",\"cleaning_bright_color_warning\",\"\u88d9, \u9838\u570d\u4ed4, \u7fbd\u7d68\u886b, \u81a8\u7dda\u886b, \u6cc5\u6c34\u5e3d, \u6cc5\u6c34\u886b\",\"\u6253\u6383\",\"clothes,pants,shoes,head\",\"clothes:\u77ed\u886b@\u70cf\u8272;pants:\u77ed\u8932@\u70cf\u8272;shoes:\u978b@\u70cf\u8272;head:\u5e3d\u4ed4@\u70cf\u8272\",\"clothes:short_shirt@black;pants:shorts@black;shoes:shoes@black;head:hat@black\",\"\",\"\",\"\"\n\"10\",\"\u8457, \u6234\",\"2\",\"\uff0c\u5728\u8857\u4e0a\u96a8\u5fc3\u642d\u914d\u4efb\u4f55\u984f\u8272\uff0c\u5c55\u73fe\u51fa\u7368\u7279\u4e14\u81ea\u4fe1\u7684\u500b\u4eba\u98a8\u683c\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u70cf\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u88d9, \u77ed\u886b, \u77ed\u8932, \u9577\u8932, \u7fbd\u7d68\u886b, \u81a8\u7dda\u886b, \u9838\u570d\u4ed4, \u5e3d\u4ed4, \u978b\",\"\",\"\",\"\",\"\",\"\u65e5\u5e38\",\"clothes,pants,shoes\",\"clothes:\u77ed\u886b@\u540a\u83dc\u8272;pants:\u88d9@\u540a\u83dc\u8272;shoes:\u978b@\u540a\u83dc\u8272\",\"clothes:short_shirt@dark_green;pants:skirt@dark_green;shoes:shoes@dark_green\",\"\",\"\",\"\"\n\"11\",\"\u8457, \u6234\",\"2\",\"\uff0c\u9019\u662f\u4eca\u5929\u6700\u5408\u9069\u7684\u88dd\u626e\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u77ed\u886b, \u77ed\u8932, \u9577\u8932, \u88d9, \u5e3d\u4ed4, \u978b\",\"\",\"\",\"\",\"\",\"\u65e5\u5e38, \u71b1\",\"clothes,pants,shoes\",\"clothes:\u77ed\u886b@\u540a\u83dc\u8272;pants:\u77ed\u8932@\u540a\u83dc\u8272;shoes:\u978b@\u767d\u8272\",\"clothes:short_shirt@dark_green;pants:shorts@dark_green;shoes:shoes@white\",\"\",\"\",\"\"\n\"12\",\"\u8457, \u6234\",\"2\",\"\uff0c\u50cf\u96ea\u7684\u984f\u8272\u4e00\u6a23\uff0c\u7a7f\u8d77\u4f86\u53c8\u6696\u548c\u3002\",\"\u662f\",\"\u767d\u8272\",\"\u7fbd\u7d68\u886b, \u81a8\u7dda\u886b, \u9838\u570d\u4ed4\",\"\",\"\",\"\",\"\",\"\u51b7\",\"clothes,pants,shoes,accessories\",\"clothes:\u7fbd\u7d68\u886b@\u767d\u8272;pants:\u9577\u8932@\u767d\u8272;shoes:\u978b@\u70cf\u8272;accessories:\u9838\u570d\u4ed4@\u767d\u8272\",\"clothes:puffer_jacket@white;pants:long_pants@white;shoes:shoes@black;accessories:scarf@white\",\"\",\"\",\"\"\n\"13\",\"\u8457\",\"2\",\"\uff0c\u6253\u7c43\u7403\u6642\u8b93\u624b\u8173\u597d\u6d3b\u52d5\uff0c\u5c55\u73fe\u6eff\u6eff\u6d3b\u529b\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u70cf\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u819d\u982d\u843d\u4ed4, \u77ed\u886b, \u77ed\u8932, \u978b\",\"\",\"\",\"\",\"\",\"\u904b\u52d5, \u71b1\",\"clothes,pants,shoes,knee\",\"clothes:\u77ed\u886b@\u9ec3\u8272;pants:\u77ed\u8932@\u9ec3\u8272;shoes:\u978b@\u767d\u8272;knee:\u819d\u982d\u843d\u4ed4@\u9ec3\u8272\",\"clothes:short_shirt@yellow;pants:shorts@yellow;shoes:shoes@white;knee:knee_protector@yellow\",\"\",\"\",\"\"\n\"14\",\"\u8457, \u6234\",\"2\",\"\uff0c\u8272\u5f69\u6d3b\u6f51\u53c8\u986f\u773c\uff0c\u591c\u665a\u51fa\u9580\u771f\u5b89\u5168\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u7d05\u8272\u82b1\u5716\u6848\",\"\u88d9, \u77ed\u886b, \u77ed\u8932, \u9577\u8932, \u7fbd\u7d68\u886b, \u81a8\u7dda\u886b, \u9838\u570d\u4ed4, \u5e3d\u4ed4, \u978b\",\"\",\"\",\"\",\"\",\"\u4eae, \u6d3b\u6f51\",\"clothes,pants,shoes\",\"clothes:\u77ed\u886b@\u9ec3\u8272;pants:\u88d9@\u67d1\u4ed4\u8272;shoes:\u978b@\u767d\u8272\",\"clothes:short_shirt@yellow;pants:skirt@orange;shoes:shoes@white\",\"\",\"\",\"\"\n\"15\",\"\u8457, \u6234\",\"2\",\"\uff0c\u65b0\u5e74\u53bb\u89aa\u621a\u5bb6\u62dc\u5e74\uff0c\u9577\u8f29\u770b\u8457\u771f\u9ad8\u8208\u3002\",\"\u662f\",\"\u7d05\u8272\u82b1\u5716\u6848, \u67d1\u4ed4\u8272, \u9ec3\u8272, \u540a\u83dc\u8272\",\"\u9577\u8932, \u88d9, \u7fbd\u7d68\u886b, \u81a8\u7dda\u886b, \u9838\u570d\u4ed4, \u5e3d\u4ed4, \u978b\",\"\",\"\",\"\",\"\u6c34\u9774\u7b52, \u6cc5\u6c34\u886b, \u6cc5\u6c34\u5e3d, \u819d\u982d\u843d\u4ed4\",\"\u5ba2\u5e84, \u51b7\",\"clothes,pants,shoes,accessories\",\"clothes:\u7fbd\u7d68\u886b@\u7d05\u8272\u82b1\u5716\u6848;pants:\u9577\u8932@\u7d05\u8272\u82b1\u5716\u6848;shoes:\u978b@\u7d05\u8272\u82b1\u5716\u6848;accessories:\u9838\u570d\u4ed4@\u7d05\u8272\u82b1\u5716\u6848\",\"clothes:puffer_jacket@red_flower_pattern;pants:long_pants@red_flower_pattern;shoes:shoes@red_flower_pattern;accessories:scarf@red_flower_pattern\",\"\u70cf\u8272, \u767d\u8272\",\"1\",\"festive_too_many_dark_colors\"\n\"16\",\"\u8457, \u6234\",\"2\",\"\uff0c\u770b\u8d77\u4f86\u771f\u6709\u7cbe\u795e\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u5e3d\u4ed4, \u77ed\u886b, \u77ed\u8932, \u9577\u8932, \u88d9, \u7fbd\u7d68\u886b, \u81a8\u7dda\u886b, \u9838\u570d\u4ed4, \u978b\",\"\",\"\",\"\",\"\",\"\u4eae\",\"clothes,pants,shoes,head\",\"clothes:\u77ed\u886b@\u9ec3\u8272;pants:\u77ed\u8932@\u9ec3\u8272;shoes:\u978b@\u767d\u8272;head:\u5e3d\u4ed4@\u67d1\u4ed4\u8272\",\"clothes:short_shirt@yellow;pants:shorts@yellow;shoes:shoes@white;head:hat@orange\",\"\",\"\",\"\"\n\"17\",\"\u8457\",\"2\",\"\uff0c\u6700\u9069\u5408\u7a7f\u53bb\u53c3\u52a0\u5ba4\u5167\u5a5a\u5bb4\uff0c\u795d\u798f\u65b0\u4eba\u3002\",\"\u662f\",\"\u767d\u8272, \u9ec3\u8272, \u67d1\u4ed4\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u77ed\u886b, \u9577\u8932, \u978b, \u88d9\",\"\u767d\u8272, \u9ec3\u8272, \u67d1\u4ed4\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u70cf\u8272\",\"\",\"\u6c34\u9774\u7b52, \u5e3d\u4ed4, \u6cc5\u6c34\u5e3d, \u6cc5\u6c34\u886b, \u819d\u982d\u843d\u4ed4\",\"\u559c\u6176\",\"clothes,pants,shoes\",\"clothes:\u77ed\u886b@\u767d\u8272;pants:\u88d9@\u7d05\u8272\u82b1\u5716\u6848;shoes:\u978b@\u767d\u8272\",\"clothes:short_shirt@white;pants:skirt@red_flower_pattern;shoes:shoes@white\",\"\",\"\",\"\"\n\"18\",\"\u8457, \u6234\",\"2\",\"\uff0c\u7a7f\u53bb\u89c0\u8cde\u6850\u82b1\u6700\u5408\u9069\uff01\u5145\u6eff\u5728\u5730\u767d\u8272\u6850\u82b1\u610f\u8c61\uff0c\u597d\u770b\u53c8\u7279\u5225\u3002\",\"\u662f\",\"\u767d\u8272\",\"\u9577\u8932, \u88d9, \u5e3d\u4ed4, \u978b, \u77ed\u886b, \u77ed\u8932\",\"\",\"\",\"\",\"\",\"\u6850\u82b1, \u71b1\",\"clothes,pants,shoes,head\",\"clothes:\u77ed\u886b@\u767d\u8272;pants:\u88d9@\u767d\u8272;shoes:\u978b@\u767d\u8272;head:\u5e3d\u4ed4@\u767d\u8272\",\"clothes:short_shirt@white;pants:skirt@white;shoes:shoes@white;head:hat@white\",\"\",\"\",\"\"\n\"19\",\"\u8457, \u6234\",\"2\",\"\uff0c\u5bcc\u6709\u676d\u83ca\u8272\u5f69\u610f\u8c61\uff0c\u6e05\u723d\u53c8\u4eae\u773c\u3002\",\"\u662f\",\"\u9ec3\u8272, \u767d\u8272\",\"\u88d9, \u9577\u8932, \u7fbd\u7d68\u886b, \u81a8\u7dda\u886b, \u978b, \u9838\u570d\u4ed4, \u77ed\u886b, \u77ed\u8932, \u88d9, \u5e3d\u4ed4\",\"\",\"\",\"\",\"\",\"\u676d\u83ca, \u51b7\",\"clothes,pants,shoes,accessories\",\"clothes:\u81a8\u7dda\u886b@\u767d\u8272;pants:\u9577\u8932@\u9ec3\u8272;shoes:\u978b@\u767d\u8272;accessories:\u9838\u570d\u4ed4@\u9ec3\u8272\",\"clothes:sweater@white;pants:long_pants@yellow;shoes:shoes@white;accessories:scarf@yellow\",\"\",\"\",\"\"\n\"20\",\"\u8457, \u6234\",\"2\",\"\uff0c\u653e\u5bd2\u5047\u548c\u5bb6\u4eba\u51fa\u9580\uff0c\u5728\u51b7\u547c\u547c\u7684\u5929\u6c23\u88e1\u5c55\u73fe\u4f60\u7684\u81ea\u4fe1\u642d\u914d\u3002\",\"\u662f\",\"X, \u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u70cf\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u7fbd\u7d68\u886b, \u81a8\u7dda\u886b, \u9838\u570d\u4ed4, \u9577\u8932\",\"\",\"\",\"\",\"\",\"\u51b7, \u65e5\u5e38\",\"clothes,pants,shoes,accessories\",\"clothes:\u7fbd\u7d68\u886b@\u540a\u83dc\u8272;pants:\u9577\u8932@\u540a\u83dc\u8272;shoes:\u978b@\u70cf\u8272;accessories:\u9838\u570d\u4ed4@\u540a\u83dc\u8272\",\"clothes:puffer_jacket@dark_green;pants:long_pants@dark_green;shoes:shoes@black;accessories:scarf@dark_green\",\"\",\"\",\"\"\n\"21\",\"\u8457\",\"1\",\"\uff0c\u51b7\u98a8\u5439\u4f86\u6642\u7a7f\u8d77\u4f86\u6696\u547c\u547c\uff0c\u51fa\u9580\u4e5f\u4e0d\u6015\u8457\u6dbc\u3002\",\"\u662f\",\"\u767d\u8272, \u70cf\u8272, \u67d1\u4ed4\u8272, \u540a\u83dc\u8272, \u7d05\u8272\u82b1\u5716\u6848\",\"\u7fbd\u7d68\u886b\",\"\",\"\",\"\",\"\",\"\u51b7\",\"clothes,pants,shoes\",\"clothes:\u7fbd\u7d68\u886b@\u767d\u8272;pants:\u9577\u8932@\u767d\u8272;shoes:\u978b@\u70cf\u8272\",\"clothes:puffer_jacket@white;pants:long_pants@white;shoes:shoes@black\",\"\",\"\",\"\"\n\"22\",\"\u6234, \u8457\",\"1\",\"\uff0c\u5929\u6c23\u8b8a\u51b7\u6642\u570d\u5728\u8116\u5b50\u4e0a\uff0c\u4fdd\u6696\u53c8\u8212\u670d\u3002\",\"\u662f\",\"X, \u67d1\u4ed4\u8272, \u9ec3\u8272, \u767d\u8272, \u70cf\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u9838\u570d\u4ed4\",\"\",\"\",\"\",\"\",\"\u51b7\",\"clothes,pants,shoes,accessories\",\"clothes:\u7fbd\u7d68\u886b@\u767d\u8272;pants:\u9577\u8932@\u767d\u8272;shoes:\u978b@\u70cf\u8272;accessories:\u9838\u570d\u4ed4@\u7121\",\"clothes:puffer_jacket@white;pants:long_pants@white;shoes:shoes@black;accessories:scarf@none\",\"\",\"\",\"\"\n\"23\",\"\u8457\",\"1\",\"\uff0c\u8e29\u904e\u7a4d\u6c34\u6642\uff0c\u96d9\u8173\u4e5f\u4e0d\u5bb9\u6613\u6fd5\u3002\",\"\u662f\",\"\u9ec3\u8272, \u70cf\u8272\",\"\u6c34\u9774\u7b52\",\"\",\"\",\"\",\"\",\"\u51b7, rain\",\"clothes,pants,shoes,accessories\",\"clothes:\u7fbd\u7d68\u886b@\u767d\u8272;pants:\u9577\u8932@\u767d\u8272;shoes:\u6c34\u9774\u7b52@\u70cf\u8272;accessories:\u9838\u570d\u4ed4@\u767d\u8272\",\"clothes:puffer_jacket@white;pants:long_pants@white;shoes:rain_boots@black;accessories:scarf@white\",\"\",\"\",\"\"\n\"24\",\"\u8457\",\"1\",\"\uff0c\u524d\u5f80\u5c55\u89bd\u9928\u770b\u756b\u5c55\uff0c\u57f9\u990a\u85dd\u8853\u6c23\u606f\u3002\",\"\u662f\",\"\u540a\u83dc\u8272\",\"\u77ed\u886b\",\"\",\"\",\"\",\"\",\"\u65e5\u5e38, \u71b1\",\"clothes,pants,shoes\",\"clothes:\u77ed\u886b@\u540a\u83dc\u8272;pants:\u77ed\u8932@\u767d\u8272;shoes:\u978b@\u767d\u8272\",\"clothes:short_shirt@dark_green;pants:shorts@white;shoes:shoes@white\",\"\",\"\",\"\"\n\"26\",\"\u8457, \u6234\",\"2\",\"\uff0c\u5728\u6cf3\u6c60\u88e1\u770b\u8d77\u4f86\u4eae\u773c\u53c8\u5b89\u5168\uff0c\u73a9\u6c34\u6642\u66f4\u5bb9\u6613\u88ab\u6ce8\u610f\u5230\u3002\",\"\u662f\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\u6cc5\u6c34\u5e3d\",\"\u67d1\u4ed4\u8272, \u9ec3\u8272, \u7d05\u8272\u82b1\u5716\u6848, \u540a\u83dc\u8272\",\"\",\"\",\"\",\"\u4eae, water, \u71b1\",\"clothes,pants,head\",\"clothes:\u6cc5\u6c34\u886b@\u7d05\u8272\u82b1\u5716\u6848;pants:\u77ed\u8932@\u9ec3\u8272;head:\u6cc5\u6c34\u5e3d@\u7d05\u8272\u82b1\u5716\u6848\",\"clothes:swimsuit@red_flower_pattern;pants:shorts@yellow;head:swim_cap@red_flower_pattern\",\"\",\"\",\"\"\n";
const tagsCsv = '';
const feedbackMessagesCsv = '';

export type Slot = 'head' | 'neck' | 'body' | 'pants' | 'knee' | 'shoes'
export type ClosetTab = 'tops' | 'bottoms' | 'shoes' | 'accessories'

export type Clothing = {
  id: string
  name: string
  color: string
  colorKey: 'blue' | 'yellow' | 'white' | 'black' | 'orange' | 'purple' | 'red_flower_pattern'
  colorMode: 'fixed' | 'dye'
  slot: Slot
  tab: ClosetTab
  closetImage: string
  wearLayers: string[]
  type: string
  verbs: string[]
  weather: string[]
  occasions: string[]
  blacklist: string[]
}

export type Question = {
  id: string
  stageId?: number
  pool?: number
  verb?: string
  context: string
  color: string
  colorPinyin: string
  requireColor?: boolean
  colorOptions?: string[]
  item: string
  itemPinyin: string
  target: Partial<Record<Slot, string>>
  allowColors?: string[]
  denyColors?: string[]
  denyColorFeedbackKey?: string
  denyItems?: string[]
  limitedColor?: string
  limitedColorMax?: number
  limitedColorFeedbackKey?: string
  tags?: string[]
  requiredSlots?: Slot[]
}

function splitList(value = '') {
  return value.split(/[\s,\n\r,、，]+/).map(s => s.trim()).filter(Boolean)
}

export const tabs: { id: ClosetTab; label: string; icon: string }[] = [
  { id: 'tops', label: '上衣', icon: '👕' },
  { id: 'bottoms', label: '下身', icon: '🩳' },
  { id: 'shoes', label: '鞋子', icon: '👟' },
  { id: 'accessories', label: '配件', icon: '🧢' },
]

type CsvRow = Record<string, string>

function parseCsv(raw: string): CsvRow[] {
  const rows: string[][] = [[]]
  let value = ''
  let quoted = false
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index]
    if (char === '"') {
      if (quoted && raw[index + 1] === '"') { value += '"'; index += 1 } else quoted = !quoted
    } else if (char === ',' && !quoted) {
      rows[rows.length - 1]?.push(value); value = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && raw[index + 1] === '\n') index += 1
      rows[rows.length - 1]?.push(value); value = ''
      rows.push([])
    } else value += char
  }
  if (value || rows[rows.length - 1]?.length) rows[rows.length - 1]?.push(value)
  const [header, ...data] = rows
  const cleanHeader = header.map(key => key.trim())
  return data.filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(cleanHeader.map((key, index) => [key, row[index] ?? ''])))
}

// Parse Vocabulary Tags from CSV
const parsedTags = parseCsv(tagsCsv)
const itemDataByName: Record<string, {
  type: string
  verbs: string[]
  weather: string[]
  occasions: string[]
  blacklist: string[]
}> = {}

for (const row of parsedTags) {
  if (row.type === 'color') continue
  const name = row.item_name.trim()
  if (!name) continue
  const allTags = row.tags ? row.tags.split(/[\s,\n\r、，]+/).map(s => s.trim()).filter(Boolean) : []
  const weather = allTags.filter(t => t === '冷' || t === '熱')
  const occasions = allTags.filter(t => t !== '冷' && t !== '熱')
  const blacklist = row.must_not ? row.must_not.split(/[\s,\n\r、，]+/).map(s => s.trim()).filter(Boolean) : []
  const verbs = row.must_verb ? row.must_verb.split(/[\s,\n\r、，]+/).map(s => s.trim()).filter(Boolean).map(v => v === '穿' ? '著' : v) : []
  itemDataByName[name] = {
    type: row.type || 'normal',
    verbs,
    weather,
    occasions,
    blacklist
  }
}

const makeClothing = (
  id: string,
  name: string,
  color: Clothing['color'],
  colorKey: Clothing['colorKey'],
  slot: Slot,
  tab: ClosetTab,
  closetImage: string,
  wearLayers = [closetImage],
  colorMode: Clothing['colorMode'] = 'dye'
): Clothing => {
  const meta = itemDataByName[name] ?? { type: 'normal', verbs: [], weather: [], occasions: [], blacklist: [] }
  return {
    id,
    name,
    color,
    colorKey,
    colorMode,
    slot,
    tab,
    closetImage,
    wearLayers,
    type: meta.type,
    verbs: meta.verbs,
    weather: meta.weather,
    occasions: meta.occasions,
    blacklist: meta.blacklist
  }
}

const baseClothing: Clothing[] = [
  makeClothing('body-blue', '藍衫', '固定藍染', 'blue', 'body', 'tops', 'hakka_shirt_B.png', ['hakka_shirt_B.png'], 'fixed'),
  makeClothing('body-yellow', '短衫', '黃色', 'yellow', 'body', 'tops', 'shirt.png'),
  makeClothing('body-white', '短衫', '白色', 'white', 'body', 'tops', 'shirt.png'),
  makeClothing('body-black', '短衫', '烏色', 'black', 'body', 'tops', 'shirt.png'),
  makeClothing('body-flower', '短衫', '紅色花圖案', 'red_flower_pattern', 'body', 'tops', 'shirt.png'),
  makeClothing('body-puffer-white', '羽絨衫', '白色', 'white', 'body', 'tops', 'puffer_jacket_B.png'),
  makeClothing('body-sweater-white', '膨線衫', '白色', 'white', 'body', 'tops', 'sweater_B.png'),
  makeClothing('body-swimsuit-yellow', '泅水衫', '黃色', 'yellow', 'body', 'tops', 'swimsuit_B.png'),
  makeClothing('pants-black', '長褲', '烏色', 'black', 'pants', 'bottoms', 'long_pants_B.png'),
  makeClothing('pants-long-white', '長褲', '白色', 'white', 'pants', 'bottoms', 'long_pants_B.png'),
  makeClothing('pants-yellow', '短褲', '黃色', 'yellow', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('pants-shorts-white', '短褲', '白色', 'white', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('pants-white', '裙', '白色', 'white', 'pants', 'bottoms', 'skirt_B_over.png'),
  makeClothing('pants-flower', '短褲', '紅色花圖案', 'red_flower_pattern', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('shoes-white', '鞋', '白色', 'white', 'shoes', 'shoes', 'sneakers_B.png'),
  makeClothing('shoes-black', '鞋', '烏色', 'black', 'shoes', 'shoes', 'sneakers_B.png'),
  makeClothing('shoes-rain', '水靴筒', '黃色', 'yellow', 'shoes', 'shoes', 'rain_boots_B.png'),
  makeClothing('head-yellow', '帽仔', '黃色', 'yellow', 'head', 'accessories', 'hat.png'),
  makeClothing('head-black', '帽仔', '烏色', 'black', 'head', 'accessories', 'hat.png'),
  makeClothing('head-swim-cap-yellow', '泅水帽', '黃色', 'yellow', 'head', 'accessories', 'head-swin.png'),
  makeClothing('neck-white', '頸圍仔', '白色', 'white', 'neck', 'accessories', 'scarf_B.png'),
  makeClothing('knee-yellow', '膝頭落仔', '黃色', 'yellow', 'knee', 'accessories', 'knee_protector_B.png'),
  makeClothing('pants-shorts-black', '短褲', '烏色', 'black', 'pants', 'bottoms', 'shorts_B.png'),
  makeClothing('head-white', '帽仔', '白色', 'white', 'head', 'accessories', 'hat.png'),
  makeClothing('pants-long-yellow', '長褲', '黃色', 'yellow', 'pants', 'bottoms', 'long_pants_B.png'),
  makeClothing('body-puffer-black', '羽絨衫', '烏色', 'black', 'body', 'tops', 'puffer_jacket_B.png'),
]

const dyeColors: { name: string; key: Clothing['colorKey'] }[] = [
  { name: '柑仔色', key: 'orange' },
  { name: '吊菜色', key: 'purple' },
  { name: '紅色花圖案', key: 'red_flower_pattern' },
]

const rainBootDyeColors: { name: string; key: Clothing['colorKey'] }[] = [
  { name: '烏色', key: 'black' },
  ...dyeColors,
]

function makeDyeVariants(prefix: string, name: string, slot: Slot, tab: ClosetTab, image: string, colors = dyeColors) {
  return colors.map((color) => makeClothing(`${prefix}-${color.key}`, name, color.name, color.key, slot, tab, image))
}

const seenDyes = new Set<string>()
export const clothing: Clothing[] = [
  ...baseClothing,
  ...makeDyeVariants('short-shirt', '短衫', 'body', 'tops', 'shirt.png'),
  ...makeDyeVariants('puffer-jacket', '羽絨衫', 'body', 'tops', 'puffer_jacket_B.png'),
  ...makeDyeVariants('sweater', '膨線衫', 'body', 'tops', 'sweater_B.png'),
  ...makeDyeVariants('swimsuit', '泅水衫', 'body', 'tops', 'swimsuit_B.png'),
  ...makeDyeVariants('long-pants', '長褲', 'pants', 'bottoms', 'long_pants_B.png'),
  ...makeDyeVariants('shorts', '短褲', 'pants', 'bottoms', 'shorts_B.png'),
  ...makeDyeVariants('skirt', '裙', 'pants', 'bottoms', 'skirt_B_over.png'),
  ...makeDyeVariants('sneakers', '鞋', 'shoes', 'shoes', 'sneakers_B.png'),
  ...makeDyeVariants('rain-boots', '水靴筒', 'shoes', 'shoes', 'rain_boots_B.png', rainBootDyeColors),
  ...makeDyeVariants('hat', '帽仔', 'head', 'accessories', 'hat.png'),
  ...makeDyeVariants('scarf', '頸圍仔', 'neck', 'accessories', 'scarf_B.png'),
  ...makeDyeVariants('knee-protector', '膝頭落仔', 'knee', 'accessories', 'knee_protector_B.png'),
  ...makeDyeVariants('swim-cap', '泅水帽', 'head', 'accessories', 'head-swin.png'),
].filter((item) => {
  const key = `${item.name}-${item.color}`
  if (seenDyes.has(key)) {
    return false
  }
  seenDyes.add(key)
  return true
})

const targetItemIds: Record<string, string> = {
  'hakka_shirt@none': 'body-blue', 'short_shirt@yellow': 'body-yellow', 'short_shirt@white': 'body-white', 'short_shirt@black': 'body-black',
  'shorts@yellow': 'pants-yellow', 'shorts@white': 'pants-shorts-white', 'shorts@black': 'pants-shorts-black',
  'long_pants@black': 'pants-black', 'long_pants@white': 'pants-long-white', 'long_pants@yellow': 'pants-long-yellow', 'skirt@white': 'pants-white',
  'shoes@white': 'shoes-white', 'shoes@black': 'shoes-black', 'rain_boots@yellow': 'shoes-rain', 'rain_boots@black': 'rain-boots-black',
  'hat@yellow': 'head-yellow', 'hat@black': 'head-black', 'hat@white': 'head-white', 'swim_cap@yellow': 'head-swim-cap-yellow', 'swimsuit@yellow': 'body-swimsuit-yellow',
  'puffer_jacket@white': 'body-puffer-white', 'puffer_jacket@black': 'body-puffer-black', 'knee_protector@yellow': 'knee-yellow', 'scarf@white': 'neck-white', 'scarf@none': 'neck-white',
}

const slotByEntity: Record<string, Slot> = {
  hakka_shirt: 'body', short_shirt: 'body', puffer_jacket: 'body', sweater: 'body', swimsuit: 'body',
  shorts: 'pants', long_pants: 'pants', skirt: 'pants', shoes: 'shoes', rain_boots: 'shoes',
  hat: 'head', swim_cap: 'head', scarf: 'neck', knee_protector: 'knee',
}

const displayEntityByChinese: Record<string, string> = {
  '藍衫': 'hakka_shirt', '短衫': 'short_shirt', '短褲': 'shorts', '長褲': 'long_pants', '裙': 'skirt', '鞋': 'shoes', '水靴筒': 'rain_boots',
  '帽仔': 'hat', '泅水帽': 'swim_cap', '頸圍仔': 'scarf', '膝頭落仔': 'knee_protector', '泅水衫': 'swimsuit',
  '羽絨衫': 'puffer_jacket', '膨線衫': 'sweater'
}

const colorLabels: Record<string, string> = { 
  yellow: '黃色', white: '白色', black: '烏色', blue: '藍色', none: '',
  orange: '柑仔色', purple: '吊菜色', red_flower_pattern: '紅色花圖案'
}
export const pinyinByWord: Record<string, string> = { 
  '藍衫': 'lamˋ samˊ', '短衫': 'donˋ qiu', '短褲': 'donˋ  fu', '長褲': 'congˇ fu', '鞋': 'haiˇ', 
  '水靴筒': 'suiˋ hioˊ thungˇ', '帽仔': 'mo eˋ', '頸圍仔': 'giangˋ viˇ eˋ', '膝頭落仔': 'qidˋ teuˇ labˋ eˋ', 
  '黃色': 'vongˇ sedˋ', '白色': 'pag sedˋ', '烏色': 'vuˊ sedˋ', '藍色': 'lamˇ sedˋ',
  '柑仔色': 'gamˊ eˋ sedˋ', '吊菜色': 'diau coi sedˋ', '紅色花圖案': 'fungˇ sedˋ faˊ bu',
  '羽絨衫': 'iˋ iungˇ samˊ', '膨線衫': 'pong xien samˊ', '泅水帽': 'qiuˇ suiˋ moapˋ', '泅水衫': 'siuˊ suiˋ samˊ'
}

export function isSameColor(c1?: string, c2?: string): boolean {
  if (!c1 || !c2) return c1 === c2
  if (c1 === c2) return true
  const flowerSet = new Set(['紅色花圖案', '紅色花布', 'red_flower_pattern'])
  return flowerSet.has(c1) && flowerSet.has(c2)
}

function findClothingId(entity: string, colorKey: string): string | undefined {
  const key = `${entity}@${colorKey}`
  if (targetItemIds[key]) return targetItemIds[key]

  const entityToNameMap: Record<string, string> = {
    hakka_shirt: '藍衫', short_shirt: '短衫', shorts: '短褲', long_pants: '長褲', skirt: '裙',
    puffer_jacket: '羽絨衫', sweater: '膨線衫', swimsuit: '泅水衫', scarf: '頸圍仔', hat: '帽仔',
    shoes: '鞋', knee_protector: '膝頭落仔', rain_boots: '水靴筒', swim_cap: '泅水帽'
  }
  const name = entityToNameMap[entity]
  if (!name) return undefined

  let searchColorKey = colorKey
  if (colorKey === 'dark_green') searchColorKey = 'purple'

  const found = clothing.find(c => c.name === name && c.colorKey === searchColorKey)
  return found?.id
}

function buildQuestionsFromCsv(): Question[] {
  return parseCsv(quizCsv).flatMap((row) => {
    const target: Partial<Record<Slot, string>> = {}
    let valid = true
    const targetTokens = row.target_outfit_ids.split(';').filter(Boolean)
    for (const token of targetTokens) {
      const [, entityAndColor = ''] = token.split(':')
      const [entity, colorKey] = entityAndColor.split('@')
      const slot = slotByEntity[entity]
      const itemId = findClothingId(entity, colorKey)
      if (!slot || !itemId) { valid = false; break }
      target[slot] = itemId
    }
    if (!valid || !Object.keys(target).length) return []

    const itemOptions = row.item.split(',').map((value) => value.trim()).filter(Boolean)
    const targetEntitySet = new Set(targetTokens.map((token) => token.split(':')[1]?.split('@')[0]).filter(Boolean))
    const item = itemOptions.find((option) => targetEntitySet.has(displayEntityByChinese[option])) ?? itemOptions[0] ?? row.item.trim()
    const promptEntity = displayEntityByChinese[item]
    const promptToken = targetTokens.map((token) => token.split(':')[1]).find((token) => token?.startsWith(`${promptEntity}@`))
    const promptColor = promptToken?.split('@')[1] ?? ''
    const requireColor = row.require_color?.trim() === '是'
    const color = item === '藍衫' || !requireColor ? '' : (colorLabels[promptColor] ?? '')

    const csvSlots = row.required_slots ? row.required_slots.split(',').map(s => s.trim()).filter(Boolean) : ['clothes', 'pants', 'shoes']
    const requiredSlots = csvSlots.map(s => {
      if (s === 'clothes') return 'body'
      if (s === 'accessories') return 'neck'
      return s as Slot
    })

    return [{
      id: `csv-${row.stage_id}`,
      stageId: Number(row.stage_id),
      pool: Number(row.Pool) || undefined,
      verb: row.stage_title.split(',')[0].trim(),
      context: row.context_text,
      color,
      colorPinyin: pinyinByWord[color] ?? color,
      requireColor,
      colorOptions: splitList(row.true_color).filter((colorName) => colorName !== 'X'),
      item,
      itemPinyin: pinyinByWord[item] ?? item,
      target,
      allowColors: splitList(row.allow_colors),
      denyColors: splitList(row.deny_colors),
      denyColorFeedbackKey: row.deny_color_feedback_key?.trim() || '',
      denyItems: splitList(row.deny_items),
      limitedColor: row.limited_color?.trim() || '',
      limitedColorMax: Number(row.limited_color_max) || undefined,
      limitedColorFeedbackKey: row.limited_color_feedback_key?.trim() || '',
      tags: row.must_have.split(',').map((tag) => tag.trim()).filter(Boolean),
      requiredSlots
    }]
  })
}

export const questions: Question[] = buildQuestionsFromCsv()

export interface FeedbackMessageData {
  key: string
  title: string
  message: string
  suggestion: string
  scoreTier: string
  scenario: string
  wrongReason: string
}

export const feedbackMessageRecords: FeedbackMessageData[] = parseCsv(feedbackMessagesCsv)
  .map((row) => ({
    key: row.key?.trim() ?? '',
    title: row.title ?? '',
    message: row.message ?? '',
    suggestion: row.suggestion ?? '',
    scoreTier: row.score_tier ?? '',
    scenario: row.scenario ?? '',
    wrongReason: row.wrong_reason ?? ''
  }))
  .filter((row) => row.key && row.message)

export const feedbackMessages: Record<string, string> = Object.fromEntries(
  feedbackMessageRecords
    .map((row) => [row.key?.trim(), row.message ?? ''])
    .filter(([key, message]) => key && message)
)
