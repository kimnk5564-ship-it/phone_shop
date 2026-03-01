import re

with open('c:/Users/home/phone_shop/prices.html', 'r', encoding='utf-8') as f:
    content = f.read()

# I will recreate the three sub-tab sections dynamically to keep them identical

iphone_table = """                            <table class="price-table">
                                <thead>
                                    <tr>
                                        <th rowspan="2">기종</th>
                                        <th rowspan="2">용량</th>
                                        <th colspan="2">SKT (109)</th>
                                        <th colspan="2">KT (110)</th>
                                        <th colspan="2">LGU+ (115)</th>
                                    </tr>
                                    <tr>
                                        <th>이동</th>
                                        <th>기변</th>
                                        <th>이동</th>
                                        <th>기변</th>
                                        <th>이동</th>
                                        <th>기변</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td rowspan="2" class="model-name-cell">아이폰 17</td>
                                        <td class="capacity-cell">256G</td>
                                        <td class="highlight-price">10</td>
                                        <td>57</td>
                                        <td class="highlight-price">24</td>
                                        <td>32</td>
                                        <td class="highlight-price">3</td>
                                        <td>35</td>
                                    </tr>
                                    <tr>
                                        <td class="capacity-cell">512G</td>
                                        <td class="highlight-price">40</td>
                                        <td>87</td>
                                        <td class="highlight-price">54</td>
                                        <td>62</td>
                                        <td class="highlight-price">33</td>
                                        <td>65</td>
                                    </tr>
                                    <tr>
                                        <td rowspan="2" class="model-name-cell">아이폰 17 AIR</td>
                                        <td class="capacity-cell">256G</td>
                                        <td class="highlight-price">49</td>
                                        <td>86</td>
                                        <td class="highlight-price">53</td>
                                        <td>61</td>
                                        <td class="highlight-price">-1</td>
                                        <td>64</td>
                                    </tr>
                                    <tr>
                                        <td class="capacity-cell">512G</td>
                                        <td class="highlight-price">79</td>
                                        <td>116</td>
                                        <td class="highlight-price">83</td>
                                        <td>91</td>
                                        <td class="highlight-price">29</td>
                                        <td>94</td>
                                    </tr>
                                    <tr>
                                        <td rowspan="2" class="model-name-cell">아이폰 17 PRO</td>
                                        <td class="capacity-cell">256G</td>
                                        <td class="highlight-price">59</td>
                                        <td>106</td>
                                        <td class="highlight-price">70</td>
                                        <td>78</td>
                                        <td class="highlight-price">52</td>
                                        <td>84</td>
                                    </tr>
                                    <tr>
                                        <td class="capacity-cell">512G</td>
                                        <td class="highlight-price">89</td>
                                        <td>136</td>
                                        <td class="highlight-price">100</td>
                                        <td>108</td>
                                        <td class="highlight-price">82</td>
                                        <td>114</td>
                                    </tr>
                                    <tr>
                                        <td rowspan="2" class="model-name-cell">아이폰 17 PRO MAX</td>
                                        <td class="capacity-cell">256G</td>
                                        <td class="highlight-price">129</td>
                                        <td>155</td>
                                        <td class="highlight-price">138</td>
                                        <td>146</td>
                                        <td class="highlight-price">129</td>
                                        <td>151</td>
                                    </tr>
                                    <tr>
                                        <td class="capacity-cell">512G</td>
                                        <td class="highlight-error">문의</td>
                                        <td class="highlight-error">문의</td>
                                        <td class="highlight-error">문의</td>
                                        <td class="highlight-error">문의</td>
                                        <td class="highlight-error">문의</td>
                                        <td class="highlight-error">문의</td>
                                    </tr>
                                </tbody>
                            </table>"""

s26_table = """                            <table class="price-table">
                                <thead>
                                    <tr>
                                        <th rowspan="2">기종</th>
                                        <th rowspan="2">용량</th>
                                        <th colspan="2">SKT (109)</th>
                                        <th colspan="2">KT (110)</th>
                                        <th colspan="2">LGU+ (115)</th>
                                    </tr>
                                    <tr>
                                        <th>이동</th>
                                        <th>기변</th>
                                        <th>이동</th>
                                        <th>기변</th>
                                        <th>이동</th>
                                        <th>기변</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="model-name-cell">S26</td>
                                        <td class="capacity-cell">512G</td>
                                        <td class="highlight-price">30</td>
                                        <td>40</td>
                                        <td class="highlight-price">15</td>
                                        <td>25</td>
                                        <td class="highlight-price">15</td>
                                        <td>25</td>
                                    </tr>
                                    <tr>
                                        <td class="model-name-cell">S26+</td>
                                        <td class="capacity-cell">512G</td>
                                        <td class="highlight-price">50</td>
                                        <td>60</td>
                                        <td class="highlight-price">35</td>
                                        <td>45</td>
                                        <td class="highlight-price">35</td>
                                        <td>45</td>
                                    </tr>
                                    <tr>
                                        <td class="model-name-cell">S26 Ultra</td>
                                        <td class="capacity-cell">512G</td>
                                        <td class="highlight-price">85</td>
                                        <td>95</td>
                                        <td class="highlight-price">70</td>
                                        <td>80</td>
                                        <td class="highlight-price">70</td>
                                        <td>80</td>
                                    </tr>
                                </tbody>
                            </table>"""

flipfold_table = """                            <table class="price-table">
                                <thead>
                                    <tr>
                                        <th rowspan="2">기종</th>
                                        <th rowspan="2">용량</th>
                                        <th colspan="2">SKT (109)</th>
                                        <th colspan="2">KT (110)</th>
                                        <th colspan="2">LGU+ (115)</th>
                                    </tr>
                                    <tr>
                                        <th>이동</th>
                                        <th>기변</th>
                                        <th>이동</th>
                                        <th>기변</th>
                                        <th>이동</th>
                                        <th>기변</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="model-name-cell">Z플립7</td>
                                        <td class="capacity-cell">256G</td>
                                        <td class="highlight-price">14</td>
                                        <td>45</td>
                                        <td class="highlight-price">28</td>
                                        <td>19</td>
                                        <td class="highlight-price">11</td>
                                        <td>6</td>
                                    </tr>
                                    <tr>
                                        <td class="model-name-cell">Z폴드7</td>
                                        <td class="capacity-cell">256G</td>
                                        <td class="highlight-price">122</td>
                                        <td>135</td>
                                        <td class="highlight-price">127</td>
                                        <td>118</td>
                                        <td class="highlight-price">110</td>
                                        <td>107</td>
                                    </tr>
                                </tbody>
                            </table>"""

def make_tab_content(region_id):
    r_iphone = f"{region_id}-iphone"
    r_galaxy = f"{region_id}-galaxy"
    r_s26 = f"{region_id}-s26"
    r_flipfold = f"{region_id}-flipfold"
    
    html = f"""                    <!-- 1차 하위 탭 (아이폰 / 갤럭시) -->
                    <div class="sub-tabs-wrapper">
                        <button class="sub-tab-btn active"
                            onclick="openSubTab(event, '{r_iphone}', 'sub-tab-btn', 'sub-tab-content')">아이폰</button>
                        <button class="sub-tab-btn"
                            onclick="openSubTab(event, '{r_galaxy}', 'sub-tab-btn', 'sub-tab-content')">갤럭시</button>
                    </div>

                    <!-- 아이폰 내용 -->
                    <div class="sub-tab-content" id="{r_iphone}" style="display: block;">
                        <div class="table-container wide-table">
{iphone_table}
                        </div>
                    </div>

                    <!-- 갤럭시 내용 -->
                    <div class="sub-tab-content" id="{r_galaxy}" style="display: none;">
                        <!-- 2차 하위 탭 (S26 / 플립&폴드) -->
                        <div class="nested-tabs-wrapper">
                            <button class="nested-tab-btn active"
                                onclick="openSubTab(event, '{r_s26}', 'nested-tab-btn', 'nested-tab-content')">S26
                                시리즈</button>
                            <button class="nested-tab-btn"
                                onclick="openSubTab(event, '{r_flipfold}', 'nested-tab-btn', 'nested-tab-content')">플립/폴드
                                시리즈</button>
                        </div>

                        <!-- S26 내용 -->
                        <div class="nested-tab-content" id="{r_s26}" style="display: block;">
                            <div class="table-container wide-table">
{s26_table}
                            </div>
                        </div>

                        <!-- 플립/폴드 내용 -->
                        <div class="nested-tab-content" id="{r_flipfold}" style="display: none;">
                            <div class="table-container wide-table">
{flipfold_table}
                            </div>
                        </div>
                    </div>"""
    return html

seoul_content = make_tab_content("seoul")
gyeonggi_content = make_tab_content("gyeonggi")
others_content = make_tab_content("others")

import re
# Replace Seoul tab content
content = re.sub(r'<div class="tab-content" id="tab-seoul" style="display: block;">.*?</div>\s*</div>\s*<div class="tab-content" id="tab-gyeonggi"', 
                 f'<div class="tab-content" id="tab-seoul" style="display: block;">\n{seoul_content}\n                </div>\n\n                <div class="tab-content" id="tab-gyeonggi"', 
                 content, flags=re.DOTALL)

# Replace Gyeonggi tab content
content = re.sub(r'<div class="tab-content" id="tab-gyeonggi" style="display: none;">.*?</div>\s*</div>\s*</div>\s*<div class="tab-content" id="tab-others"', 
                 f'<div class="tab-content" id="tab-gyeonggi" style="display: none;">\n{gyeonggi_content}\n                </div>\n\n                <div class="tab-content" id="tab-others"', 
                 content, flags=re.DOTALL)

# Replace Others tab content
content = re.sub(r'<div class="tab-content" id="tab-others" style="display: none;">.*?<div class="table-note"', 
                 f'<div class="tab-content" id="tab-others" style="display: none;">\n{others_content}\n                </div>\n\n                <div class="table-note"', 
                 content, flags=re.DOTALL)

with open('c:/Users/home/phone_shop/prices.html', 'w', encoding='utf-8') as f:
    f.write(content)
