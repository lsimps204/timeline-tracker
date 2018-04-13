<template>
    <div class="container">
        <div class="d-flex justify-content-between">
            <p id="att-title" class="text-success text-center">{{ title | caps }}</p>
            <small>
                <button class="btn btn-sm btn-primary" @click="back">Return to event</button>
            </small>
        </div>
        <hr/>
        <img id="attachment-image" :src="src"/>
    </div>
</template>

<script>
import Attachment from '../models/Attachment.js'

export default {
    data() {
        return {
            id: this.$route.params.id.trim(),
            source: ''
        }
    },

    computed: {
        attachment() {
            return this.$store.getters.getAttachmentFromLocalData(this.id)
        },
        src() {
            if (this.attachment) return this.attachment.data 
            else return this.source
        },
        title() {
            if (this.attachment) {
                return this.attachment.title
            }
            if(this.$store.getters.getAttachment(this.id))
                return this.$store.getters.getAttachment(this.id).Title
        }
        
    },
    filters: {
        caps: (text) => text.toUpperCase()
    },

    methods: {
        getAttachment() {
            return new Promise((resolve,reject) => {
                Attachment.getDownloadLink(this.id)
                .then(response => {
                    this.download(response.data).then(res => resolve())
                })
            })
        },

        download(url) {
            return new Promise((resolve,reject) => {
                Attachment.download(url).then(response => {
                    this.source = response.data
                    resolve()
                })
            })
        },

        back(){
            this.$router.go(-1)
        }
    },

    created() {
        if (!this.attachment) {
            this.getAttachment()
        }
    }
    
}
</script>

<style>
#attachment-image {
    height: 75%;
    width: 100%;
}

#att-title {
    font-size: 28px;
}
</style>