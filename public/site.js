loadEssentials();
let selectedValues = [];
let selectedValuesAuthors = [];

$('body').on('change', '#lstAuthHistory > li', async function () {
    try {
        $('#load-screen').show();
        //tratar o id do checkbox
        //tratar o click no icone chat
        const val = $(this).find('input').val()
        let all = null;
        if (val === 'T' && $(this).find('input').prop('checked')) {
            all = 'T';
            const list = $('#lstAuthHistory').find('input').toArray();
            list.forEach((val, i) => {
                if ($(val).val() !== 'T') {
                    $($('#lstAuthHistory').find('input')[i]).prop('checked', false);
                }
            })
        } else {
            if ($(this).find('input').prop('checked')) {
                $('#checkbox-T').prop('checked', false);
                selectedValuesAuthors.push(val);
            } else {
                selectedValuesAuthors = selectedValuesAuthors.filter((selectedValue) => selectedValue !== val);
            }
        }
        // console.log('Lives', selectedValues)
        // console.log('Authors', selectedValuesAuthors)
        let dataBase = [];
        await Promise.all(selectedValues.map(async (id) => {
            const chatResponse = await fetch(`/chatbyliveid?liveId=${id}`);
            const chatData = await chatResponse.json();
            if (chatData.length > 0) {
                chatData.forEach(async (e) => {
                    dataBase.push(e);
                })
            };
        }));
        dataBase.sort((a, b) => a.timestamp - b.timestamp);
        if (all !== 'T') {
            let chat = [];
            selectedValuesAuthors.map((e) => {
                const chatFiltered = dataBase.filter(function (i) {
                    return i.author.id === e;
                });
                chatFiltered.forEach((j) => {
                    chat.push(j);
                });
            })
            chat.sort((a, b) => a.timestamp - b.timestamp);
            createChatTable(chat, "tblChatHistory")
        } else {
            createChatTable(dataBase, "tblChatHistory")
        }
    } catch (err) {
        console.error(err.message);
    } finally {
        $('#load-screen').hide();
    }
});

function clearCheckedAuthors(pList) {
    $('#' + pList).find('input').prop('checked', false);
    $('#' + pList).find('input').fist().trigger('change');

}

$('body').on('change', '#lstChatHistory > li', async function () {
    try {
        $('#load-screen').show();
        clearCheckedAuthors('lstAuthHistory');
        selectedValuesAuthors = [];
        const val = $(this).find('input').val()
        if ($(this).find('input').prop('checked')) {
            selectedValues.push(val);
        } else {
            selectedValues = selectedValues.filter((selectedValue) => selectedValue !== val);
        }

        let dataBase = [];
        await Promise.all(selectedValues.map(async (id) => {
            const chatResponse = await fetch(`/chatbyliveid?liveId=${id}`);
            const chatData = await chatResponse.json();
            if (chatData.length > 0) {
                chatData.forEach(async (e) => {
                    dataBase.push(e);
                })
            };
        }));
        dataBase.sort((a, b) => a.timestamp - b.timestamp);

        $('#lstAuthHistory').empty();
        if (dataBase.length > 0) {
            const result = dataBase.reduce((acc, curr) => {
                const { author } = curr;
                const existingAuthor = acc.find((a) => a.author.id === author.id);
                if (existingAuthor) {
                    existingAuthor.count++;
                } else {
                    acc.push({ author, count: 1 });
                }
                return acc;
            }, []);
            result.sort((a, b) => a.author.name.trim().localeCompare(b.author.name.trim()));

            if (result.length > 0) {
                $('#lstAuthHistory').append(`
                <li class="d-flex justify-content-between">
                    <div class="form-check">
                        <input class="form-check-input form-check-input-sm" type="checkbox" id="checkbox-T" value="T">
                        <label class="form-check-label text-truncate" for="checkbox-T"><b>TODOS</b></label>
                    </li>
                </div>`);
                result.forEach((e, i) => {
                    let icon = '';
                    let auxIcon = jumentos.map(m => m.channelId).indexOf(e.author.id);
                    let realName = ''
                    if (auxIcon !== -1) {
                        icon = `<i class="fa-solid ${jumentos[auxIcon].icon}"></i> `;
                        if (e.author.name !== jumentos[auxIcon].realName && jumentos[auxIcon].realName !== '') {
                            realName = `(${jumentos[auxIcon].realName})`;
                        }
                    }
                    $('#lstAuthHistory').append(`
                    <li class="d-flex justify-content-between">
                        <div class="form-check">
                            <input class="form-check-input form-check-input-sm" type="checkbox" id="checkbox-${e.author.id}" value="${e.author.id}">
                            ${icon}
                            <label class="form-check-label text-truncate" for="checkbox-${e.author.id}">(${e.count}) ${e.author.name} ${realName}</label>
                        </div>
                    </li>
                `);
                });
            }
        }
        const list = $('#lstAuthHistory').find('input').toArray();
        list.forEach((val, i) => {
            if ($(val).val() === 'T') {
                $($('#lstAuthHistory').find('input')[i]).prop('checked', true).trigger('change');
            }
        })
    } catch (err) {
        console.error(err);
    } finally {
        $('#load-screen').hide();
    }
});

$("#btnGetData").on('click', async () => {
    const videoId = $('#ttbVideoId').val()
    try {
        $('#load-screen').show()
        const response = await fetch(`/getdata?videoId=${videoId}`);
        let data = await response.json();
        
    } catch (err) {
        console.error(err);
    } finally {
        $('#load-screen').hide();
        loadEssentials();
        $('#nav-channel-tab').click();
    }
});

$("#btn-getlive").on('click', async () => {
    const videoId = $('#ttb-liveid').val()
    try {
        $('#load-screen').show()
        const response = await fetch(`/getchat?videoId=${videoId}`);
        let data = await response.json();
        console.log(data)
        const result = data.reduce((acc, curr) => {
            const { author } = curr;
            const existingAuthor = acc.find((a) => a.author.id === author.id);
            if (existingAuthor) {
                existingAuthor.count++;
            } else {
                acc.push({ author, count: 1 });
            }
            return acc;
        }, []);
        result.sort((a, b) => a.author.name.trim().localeCompare(b.author.name.trim()));
        createList('lstAuthHistory', result, 'author');
        createChatTable(data, 'tblChatHistory')
    } catch (err) {
        console.error(err);
    } finally {
        $('#load-screen').hide();
        loadEssentials();
        $('#nav-channel-tab').click();
    }
});

$('body').on('click', 'td > img', (e) => {
    let imageUrl = $(e.currentTarget).data('pictureurl');
    let newImageUrl = imageUrl.replace(/s32/g, '');
    showChannelImage($(e.currentTarget).parent().find('a').text(), newImageUrl);
})

$('body').on('click', '#iPlayVideo', function () {
    const videoId = $(this).parent().parent().data('videoid');
    const title = $(this).parent().prev().prev().text().trim() + ' - ' + $(this).parent().prev().text().trim();
    showVideo(title, videoId);
});

$('body').on('click', '#iPlayVideoMax', function () {
    const videoId = $(this).parent().parent().data('videoid');
    const title = $(this).parent().prev().prev().text().trim() + ' - ' + $(this).parent().prev().text().trim();
    showVideo(title, videoId + '_maxres');
});

$('body').on('click', '#iComments', function () {
    const videoId = $(this).parent().parent().data('videoid');
    $('#nav-chathistory-tab').click();
    $('#checkbox-' + videoId).prop('checked', true).trigger('change');
});

$('body').on('click', '#iDownload', async function () {
    const videoId = $(this).parent().parent().data('videoid');
    $(this).toggleClass('fa-spinner fa-spin');
    await fetch(`/downloadvideo?videoId=${videoId}`, { method: 'GET' })
        .then(response => response.json())
        .then(r => {
            $(this).toggleClass('fa-spinner fa-spin fa-check');
        })
});

$('body').on('click', '#iDownloadMaxRes', async function () {
    const videoId = $(this).parent().parent().parent().data('videoid');
    $(this).removeClass('fa-download');
    $(this).addClass('fa-spinner fa-spin');
    await fetch(`/downloadvideomaxres?videoId=${videoId}`, { method: 'GET' })
        .then(response => response.json())
        .then(r => {
            $(this).removeClass('fa-spinner fa-spin');
            $(this).addClass('fa-check');
        })
});

function clearCheckedAuthors(pList) {
    $('#' + pList).find('input').prop('checked', false);
    $('#' + pList).find('input').first().trigger('change');
}

async function loadEssentials() {
    try {
        $('#lstChatHistory, #tblVideos').empty()
        $('#load-screen').show();
        const reponse = await fetch('/essentials');
        if (!reponse.ok) {
            throw new Error(`Erro ${reponse.status} - ${reponse.statusText}`);
        }
        const data = await reponse.json();
        jumentos = data.jumentos;
        emojis = data.emojis;
        // dlVideos = data.dlVideos;
        // const videosData = data.videos;
        // createVideoTable(videosData, 'tblVideos', 'lstChatHistory')
    } catch (err) {
        console.error(err.message);
        showModal('Erro', err.message);
    } finally {
        $('#load-screen').hide();
    }
}

