<template>
    <setting-container title="自动回复设置" @confirm="handleSave">
        <div class="auto-reply-setting">
            <div class="action-btn">
                <a-switch v-model="enable">
                    <template #checked>
                        开
                    </template>
                    <template #unchecked>
                        关
                    </template>
                </a-switch>
                <a-button type="text" @click="handleShowAdd">
                    <template #icon>
                        <icon-plus />
                    </template>
                    加一条
                </a-button>
            </div>
            <a-list class="auto-reply-list">
                <a-list-item v-for="item, index in list" :key="item.keyword">
                    <a-list-item-meta>
                        <template #title>
                            <icon-message class="icon-keyword"/>
                            <code v-if="item.isRegExp">{{ item.keyword }}</code>
                            <span v-else>{{ item.keyword }}</span>
                            <a-tag v-if="item.isRegExp" color="blue" size="small">
                                <template #icon>
                                    <icon-code />
                                </template>
                                正则
                            </a-tag>
                            <a-tag v-if="item.order" color="orangered" size="small">
                                <template #icon>
                                    <icon-history />
                                </template>
                                {{ item.order }}
                            </a-tag>
                        </template>
                        <template #description>
                            <icon-customer-service class="icon-reply"/>
                            <span>{{ item.replyContent }}</span>
                        </template>
                    </a-list-item-meta>
                    <template #actions>
                        <icon-edit @click="handleShowEdit(item, index)" />
                        <icon-delete @click="handleRemove(item, index)" />
                    </template>
                </a-list-item>
            </a-list>
            <a-modal v-model:visible="modalVisible" :on-before-ok="onBeforeOk" @ok="handleOk" title="添加关键词" fullscreen>
                <a-form ref="formEl" :model="form" :rules="rules">
                    <a-form-item field="keyword" label="关键词">
                        <a-input v-model="form.keyword" placeholder="请输入关键词..." />
                    </a-form-item>
                    <a-form-item field="replyContent" label="回复内容">
                        <a-textarea v-model="form.replyContent" placeholder="请输入回复内容..." />
                    </a-form-item>
                </a-form>
            </a-modal>
        </div>
    </setting-container>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { Form, Message } from '@arco-design/web-vue';
import SettingContainer from '../components/setting-container.vue';
import { AutoReply } from '@/utils/config';
import { config } from '@/utils/config';
import { saveConfig } from '@/utils/config';
import DataUtil from '@/utils/data.util';

const enable = ref(config.value.enableAutoReply ?? false);
const list = ref<AutoReply[]>([...config.value.autoReplies ?? []])

const getDefaultForm = () => ({
    keyword: '',
    replyContent: ''
})
const formEl = ref<InstanceType<typeof Form>>();
const form = ref<AutoReply>(getDefaultForm());

const rules = {
    keyword: [
        { required: true, message: '请输入' }
    ],
    replyContent: [
        { required: true, message: '请输入' }
    ]
};

const modalVisible = ref(false);

const handleShowAdd = () => {
    modalVisible.value = true;
    form.value = getDefaultForm();
};

let editingIndex = -1;
const handleShowEdit = (item: AutoReply, index: number) => {
    editingIndex = index;
    modalVisible.value = true;
    form.value = { ...item };
};
const handleRemove = (item: AutoReply, index: number) => {
    editingIndex = -1;
    list.value = [...list.value];
    list.value.splice(index, 1);
};

const onBeforeOk = (done: (closed: boolean) => void) => {
    formEl.value?.validate((errors) => {
        done(!errors);
    })
};

const handleOk = () => {
    const reg = DataUtil.parseRegExpRule(form.value.keyword);
    if (reg) {
        form.value.keyword = reg.toString();
        form.value.isRegExp = true;
    } else {
        form.value.isRegExp = false;
    }
    if (~editingIndex) {
        list.value[editingIndex] = form.value;
    } else {
        list.value.unshift(form.value);
    }
};

const handleSave = async () => {
    config.value.enableAutoReply = enable.value;
    config.value.autoReplies = list.value;
    const res = await saveConfig();
    if (res) {
        console.log('handleSave');
        Message.success('保存成功');
    }
};
</script>

<style lang="scss" scoped>
.auto-reply-setting {
    .action-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .auto-reply-list {
        margin-top: 8px;

        .arco-tag {
            margin-left: 4px;
        }

        code {
            padding: 0 4px;
            border-radius: 4px;
            outline: 1px solid #cecece;
            background-color: #eee;
        }

        .icon-keyword,
        .icon-reply {
            margin-right: 4px;
            color: #999;
        }
    }
}
</style>