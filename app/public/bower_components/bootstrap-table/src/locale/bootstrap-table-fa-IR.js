/**
 * Bootstrap Table English translation
 * Author: Zhixin Wen<wenzhixin2010@gmail.com>
 */
(function ($) {
    'use strict';

    $.fn.bootstrapTable.locales['fa-IR'] = {
        formatLoadingMessage: function () {
            return 'بارگزاری، صبر کنید  ...';
        },
        formatRecordsPerPage: function (pageNumber) {
            return pageNumber + ' ردیف در هر صفحه';
        },
        formatShowingRows: function (pageFrom, pageTo, totalRows) {
            return 'نمایش ' + pageFrom + ' تا ' + pageTo + ' از ' + totalRows + ' ردیف';
        },
        formatSearch: function () {
            return 'جستجو';
        },
        formatNoMatches: function () {
            return 'No matching records found';
        },
        formatPaginationSwitch: function () {
            return 'Hide/Show pagination';
        },
        formatRefresh: function () {
            return 'بروزرسانی';
        },
        formatToggle: function () {
            return 'Toggle';
        },
        formatColumns: function () {
            return 'ستون';
        },
        formatAllRows: function () {
            return 'همه';
        }
    };

    $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['fa-IR']);

})(jQuery);
